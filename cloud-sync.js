import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const config = window.MONEY_TRACKER_FIREBASE_CONFIG || {};
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
const configReady = requiredKeys.every(k => config[k] && !String(config[k]).startsWith("ISI_"));

function emit(detail){
  window.dispatchEvent(new CustomEvent("money-cloud-status", {detail}));
}
function deepClone(value){ return JSON.parse(JSON.stringify(value)); }
function hash(value){ return JSON.stringify(value); }
function friendlyError(error){
  const code = error?.code || "";
  const map = {
    "auth/email-already-in-use":"Email ini sudah punya akun. Tekan Masuk.",
    "auth/invalid-email":"Bentuk emailnya belum benar.",
    "auth/weak-password":"Password terlalu pendek. Minimal 6 karakter.",
    "auth/invalid-credential":"Email atau password salah.",
    "auth/user-not-found":"Akun belum ada. Tekan Buat Akun Baru.",
    "auth/wrong-password":"Password salah.",
    "auth/too-many-requests":"Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
    "auth/network-request-failed":"Internet sedang tidak nyambung.",
    "permission-denied":"Izin Firestore ditolak. Cek Firestore Rules.",
    "failed-precondition":"Firestore belum siap atau ada pengaturan yang belum selesai."
  };
  return new Error(map[code] || error?.message || "Ada gangguan pada cloud.");
}

if(!configReady){
  window.MoneyCloud = {
    configReady:false,
    isSignedIn:()=>false,
    queueState:()=>{},
    register:async()=>{throw new Error("Firebase belum diisi di firebase-config.js");},
    login:async()=>{throw new Error("Firebase belum diisi di firebase-config.js");},
    logout:async()=>{},
    resetPassword:async()=>{throw new Error("Firebase belum diisi di firebase-config.js");},
    replaceCloudWithLocal:async()=>{throw new Error("Firebase belum diisi di firebase-config.js");},
    pullCloud:async()=>{throw new Error("Firebase belum diisi di firebase-config.js");},
    syncNow:async()=>{throw new Error("Firebase belum diisi di firebase-config.js");}
  };
  emit({configured:false,signedIn:false,kind:"error",label:"Cloud belum diatur",message:"Isi firebase-config.js dulu."});
} else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(()=>{});

  let db;
  try{
    db = initializeFirestore(app, {
      localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})
    });
  }catch(e){
    db = getFirestore(app);
  }

  let currentUser = null;
  let unsubscribeSettings = null;
  let unsubscribeTransactions = null;
  let settingsLoaded = false;
  let transactionsLoaded = false;
  let cloudSettings = null;
  let cloudTransactions = new Map();
  let lastSettingsHash = "";
  let lastTransactionHashes = new Map();
  let initialCloudApplied = false;
  let pendingState = null;
  let uploadTimer = null;
  let lastSyncAt = null;
  let applyingSnapshot = false;

  const hooks = ()=>window.moneyTrackerHooks;
  const settingsRef = uid=>doc(db,"users",uid,"settings","app");
  const txCollection = uid=>collection(db,"users",uid,"transactions");
  const txRef = (uid,id)=>doc(db,"users",uid,"transactions",id);

  function settingsFromState(state){
    return {
      categories:deepClone(state.categories || []),
      accounts:deepClone(state.accounts || []),
      periods:deepClone(state.periods || []),
      budgetPlans:deepClone(state.budgetPlans || []),
      moneyPlans:deepClone(state.moneyPlans || []),
      allocationPercentages:deepClone(
        state.allocationPercentages || {
          needs:50,
          wants:30,
          saving:20
        }
      ),
      sync:deepClone(state.sync || {deletedTransactionIds:[]}),
      schemaVersion:7
    };
  }
  function stateFromCloud(localState, preferLocalSettings=false){
    const local = deepClone(localState || {});
    const remoteSettings = cloudSettings || {};
    const localSettings = settingsFromState(local);
    const chosen = preferLocalSettings ? localSettings : {
      categories:Array.isArray(remoteSettings.categories) ? remoteSettings.categories : localSettings.categories,
      accounts:Array.isArray(remoteSettings.accounts) ? remoteSettings.accounts : localSettings.accounts,
      periods:Array.isArray(remoteSettings.periods) ? remoteSettings.periods : localSettings.periods,
      budgetPlans:Array.isArray(remoteSettings.budgetPlans) ? remoteSettings.budgetPlans : localSettings.budgetPlans,
      moneyPlans:Array.isArray(remoteSettings.moneyPlans) ? remoteSettings.moneyPlans : localSettings.moneyPlans,
      allocationPercentages:
        remoteSettings.allocationPercentages &&
        typeof remoteSettings.allocationPercentages === "object"
          ? remoteSettings.allocationPercentages
          : localSettings.allocationPercentages,
      sync:remoteSettings.sync && typeof remoteSettings.sync === "object" ? remoteSettings.sync : localSettings.sync
    };

    const tombstones = new Set([
      ...((local.sync && local.sync.deletedTransactionIds) || []),
      ...((chosen.sync && chosen.sync.deletedTransactionIds) || [])
    ]);
    const merged = new Map();
    for(const tx of (local.transactions || [])) if(tx?.id && !tombstones.has(tx.id)) merged.set(tx.id, tx);
    for(const [id,tx] of cloudTransactions.entries()) if(!tombstones.has(id)) merged.set(id, tx);

    return {
      transactions:[...merged.values()],
      categories:deepClone(chosen.categories || []),
      accounts:deepClone(chosen.accounts || []),
      periods:deepClone(chosen.periods || []),
      budgetPlans:deepClone(chosen.budgetPlans || []),
      moneyPlans:deepClone(chosen.moneyPlans || []),
      allocationPercentages:deepClone(
        chosen.allocationPercentages || {
          needs:50,
          wants:30,
          saving:20
        }
      ),
      sync:{...(deepClone(chosen.sync || {})), deletedTransactionIds:[...tombstones].slice(-2000), schemaVersion:7}
    };
  }

  function emitCurrent(kind,message,label){
    emit({
      configured:true,
      signedIn:!!currentUser,
      email:currentUser?.email || "",
      kind,
      label:label || (currentUser ? "Cloud aktif" : "Belum login"),
      message,
      lastSync:lastSyncAt
    });
  }

  function cloudHasData(){ return !!cloudSettings || cloudTransactions.size > 0; }

  async function applyInitialCloud(){
    if(!currentUser || initialCloudApplied || !settingsLoaded || !transactionsLoaded || !hooks()) return;
    initialCloudApplied = true;
    const local = hooks().getState();
    if(!cloudHasData()){
      emitCurrent("syncing","Cloud masih kosong. Data device ini sedang dinaikkan.","Mengirim data");
      await uploadState(local,{force:true,replace:false});
      return;
    }
    const localSettingsDirty = hash(settingsFromState(local)) !== lastSettingsHash;
    const merged = stateFromCloud(local, localSettingsDirty && (local.transactions?.length || 0) > 0);
    applyingSnapshot = true;
    hooks().applyCloudState(merged,{showToast:false,message:"Data cloud sudah masuk."});
    applyingSnapshot = false;
    pendingState = merged;
    await uploadState(merged,{force:false,replace:false});
    emitCurrent("ready","Data MacBook dan iPhone sudah terhubung.","Cloud aktif");
  }

  async function applyRealtimeCloud(){
    if(!currentUser || !initialCloudApplied || !settingsLoaded || !transactionsLoaded || !hooks() || applyingSnapshot) return;
    const local = hooks().getState();
    const localSettingsDirty = hash(settingsFromState(local)) !== lastSettingsHash;
    const merged = stateFromCloud(local, localSettingsDirty);
    const before = hash(local);
    const after = hash(merged);
    if(before !== after){
      applyingSnapshot = true;
      hooks().applyCloudState(merged,{showToast:false});
      applyingSnapshot = false;
    }
    emitCurrent(navigator.onLine ? "ready" : "offline", navigator.onLine ? "Perubahan terbaru sudah masuk." : "Offline. Data menunggu internet.", navigator.onLine ? "Cloud aktif" : "Mode offline");
  }

  async function commitOperations(ops){
    for(let i=0;i<ops.length;i+=400){
      const batch = writeBatch(db);
      for(const op of ops.slice(i,i+400)){
        if(op.type === "set") batch.set(op.ref, op.data, op.options || {});
        else if(op.type === "delete") batch.delete(op.ref);
      }
      await batch.commit();
    }
  }

  async function uploadState(sourceState,{force=false,replace=false}={}){
    if(!currentUser) throw new Error("Login dulu ya.");
    if(!initialCloudApplied && !force){
      pendingState = deepClone(sourceState || hooks()?.getState?.() || {});
      return;
    }
    const state = deepClone(sourceState || hooks()?.getState?.() || {});
    const uid = currentUser.uid;
    const settings = settingsFromState(state);
    const now = Date.now();
    const settingsData = {...settings, updatedAtMs:now, updatedAt:serverTimestamp(), updatedByDevice:hooks()?.getDeviceId?.() || "unknown"};
    const currentTx = new Map((state.transactions || []).filter(t=>t?.id).map(t=>[t.id,t]));
    const tombstones = new Set((state.sync && state.sync.deletedTransactionIds) || []);
    const opMap = new Map();
    const putOp = op=>opMap.set(op.ref.path,op);

    if(force || hash(settings) !== lastSettingsHash){
      putOp({type:"set",ref:settingsRef(uid),data:settingsData,options:{merge:false}});
    }

    for(const [id,tx] of currentTx.entries()){
      if(tombstones.has(id)) continue;
      const txHash = hash(tx);
      if(force || lastTransactionHashes.get(id) !== txHash){
        putOp({type:"set",ref:txRef(uid,id),data:{...deepClone(tx),_updatedAtMs:now,_updatedByDevice:hooks()?.getDeviceId?.() || "unknown"},options:{merge:false}});
      }
    }

    const knownRemoteIds = replace ? new Set(cloudTransactions.keys()) : new Set(lastTransactionHashes.keys());
    for(const id of knownRemoteIds){
      if(!currentTx.has(id) || tombstones.has(id)) putOp({type:"delete",ref:txRef(uid,id)});
    }
    for(const id of tombstones) putOp({type:"delete",ref:txRef(uid,id)});

    const ops = [...opMap.values()];
    if(!ops.length){
      lastSyncAt = Date.now();
      emitCurrent(navigator.onLine ? "ready" : "offline", navigator.onLine ? "Tidak ada perubahan baru." : "Data tersimpan offline dan akan dikirim nanti.", navigator.onLine ? "Cloud aktif" : "Mode offline");
      return;
    }

    emitCurrent(navigator.onLine ? "syncing" : "offline", navigator.onLine ? "Sedang mengirim perubahan ke cloud…" : "Internet mati. Perubahan masuk antrean.", navigator.onLine ? "Menyinkronkan" : "Mode offline");
    try{
      await commitOperations(ops);
      lastSettingsHash = hash(settings);
      lastTransactionHashes = new Map([...currentTx.entries()].filter(([id])=>!tombstones.has(id)).map(([id,tx])=>[id,hash(tx)]));
      lastSyncAt = Date.now();
      emitCurrent(navigator.onLine ? "ready" : "offline", navigator.onLine ? "Semua perubahan sudah tersimpan." : "Perubahan tersimpan di device dan menunggu internet.", navigator.onLine ? "Cloud aktif" : "Mode offline");
    }catch(error){
      const e = friendlyError(error);
      emitCurrent(navigator.onLine ? "error" : "offline", e.message, navigator.onLine ? "Cloud error" : "Mode offline");
      throw e;
    }
  }

  function queueState(state){
    if(!currentUser || applyingSnapshot) return;
    pendingState = deepClone(state);
    if(!initialCloudApplied) return;
    clearTimeout(uploadTimer);
    uploadTimer = setTimeout(()=>{
      uploadState(pendingState,{force:false,replace:false}).catch(()=>{});
    },700);
  }

  async function replaceCloudWithLocal(state){
    if(!currentUser) throw new Error("Login dulu ya.");
    const snap = await getDocs(txCollection(currentUser.uid));
    cloudTransactions = new Map(snap.docs.map(d=>[d.id,d.data()]));
    lastTransactionHashes = new Map(snap.docs.map(d=>[d.id,hash(stripTxMeta(d.data()))]));
    await uploadState(state,{force:true,replace:true});
  }

  function stripTxMeta(data){
    const tx = deepClone(data || {});
    delete tx._updatedAtMs;
    delete tx._updatedByDevice;
    return tx;
  }

  async function pullCloud(){
    if(!currentUser || !hooks()) throw new Error("Login dulu ya.");
    const [settingsSnap,txSnap] = await Promise.all([getDoc(settingsRef(currentUser.uid)),getDocs(txCollection(currentUser.uid))]);
    cloudSettings = settingsSnap.exists() ? settingsSnap.data() : null;
    cloudTransactions = new Map(txSnap.docs.map(d=>[d.id,stripTxMeta(d.data())]));
    const local = hooks().getState();
    const remoteOnly = stateFromCloud({...local,transactions:[],sync:{deletedTransactionIds:[]}},false);
    applyingSnapshot = true;
    hooks().applyCloudState(remoteOnly,{message:"Data cloud sudah dipasang di device ini."});
    applyingSnapshot = false;
    lastSyncAt = Date.now();
    emitCurrent("ready","Data cloud sudah diambil.","Cloud aktif");
  }

  function stopListeners(){
    if(unsubscribeSettings) unsubscribeSettings();
    if(unsubscribeTransactions) unsubscribeTransactions();
    unsubscribeSettings = unsubscribeTransactions = null;
    settingsLoaded = transactionsLoaded = false;
    cloudSettings = null;
    cloudTransactions = new Map();
    lastSettingsHash = "";
    lastTransactionHashes = new Map();
    initialCloudApplied = false;
  }

  function startListeners(user){
    stopListeners();
    unsubscribeSettings = onSnapshot(settingsRef(user.uid),{includeMetadataChanges:true},snap=>{
      cloudSettings = snap.exists() ? snap.data() : null;
      if(cloudSettings){
        const copy = deepClone(cloudSettings);
        delete copy.updatedAt;
        delete copy.updatedAtMs;
        delete copy.updatedByDevice;
        lastSettingsHash = hash(copy);
      }else lastSettingsHash = "";
      settingsLoaded = true;
      if(snap.metadata.hasPendingWrites) emitCurrent("syncing","Perubahan sedang dikirim…","Menyinkronkan");
      applyInitialCloud()
        .then(()=>applyRealtimeCloud())
        .catch(e=>emitCurrent("error",friendlyError(e).message,"Cloud error"));
    },error=>emitCurrent("error",friendlyError(error).message,"Cloud error"));

    unsubscribeTransactions = onSnapshot(txCollection(user.uid),{includeMetadataChanges:true},snap=>{
      cloudTransactions = new Map(snap.docs.map(d=>[d.id,stripTxMeta(d.data())]));
      lastTransactionHashes = new Map([...cloudTransactions.entries()].map(([id,tx])=>[id,hash(tx)]));
      transactionsLoaded = true;
      if(snap.metadata.hasPendingWrites) emitCurrent("syncing","Transaksi sedang dikirim…","Menyinkronkan");
      applyInitialCloud()
        .then(()=>applyRealtimeCloud())
        .catch(e=>emitCurrent("error",friendlyError(e).message,"Cloud error"));
    },error=>emitCurrent("error",friendlyError(error).message,"Cloud error"));
  }

  onAuthStateChanged(auth,user=>{
    currentUser = user;
    if(user){
      emitCurrent("syncing","Akun masuk. Sedang membaca cloud…","Menghubungkan");
      startListeners(user);
    }else{
      stopListeners();
      emit({configured:true,signedIn:false,kind:"",label:"Belum login",message:"Firebase siap. Silakan login.",lastSync:lastSyncAt});
    }
  });

  window.addEventListener("offline",()=>emitCurrent("offline","Internet mati. Data tetap aman di device.","Mode offline"));
  window.addEventListener("online",()=>{
    emitCurrent("syncing","Internet hidup lagi. Menyinkronkan…","Menyinkronkan");
    if(currentUser && hooks()) uploadState(hooks().getState(),{force:false,replace:false}).catch(()=>{});
  });

  window.MoneyCloud = {
    configReady:true,
    isSignedIn:()=>!!currentUser,
    getUser:()=>currentUser,
    queueState,
    register:async(email,password)=>{
      try{return await createUserWithEmailAndPassword(auth,email,password);}catch(e){throw friendlyError(e);}
    },
    login:async(email,password)=>{
      try{return await signInWithEmailAndPassword(auth,email,password);}catch(e){throw friendlyError(e);}
    },
    logout:async()=>{
      try{return await signOut(auth);}catch(e){throw friendlyError(e);}
    },
    resetPassword:async(email)=>{
      try{return await sendPasswordResetEmail(auth,email);}catch(e){throw friendlyError(e);}
    },
    replaceCloudWithLocal,
    pullCloud,
    syncNow:async(state)=>uploadState(state || hooks()?.getState?.(),{force:false,replace:false})
  };

  emit({configured:true,signedIn:false,kind:"",label:"Belum login",message:"Firebase siap. Silakan login.",lastSync:null});
}
