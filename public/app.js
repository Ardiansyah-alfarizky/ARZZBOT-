const $ = id => document.getElementById(id);
async function loadStatus(){
  try{
    const r=await fetch('/api/status'); const d=await r.json();
    $('connection').textContent=d.configured?'Configured':'Not configured';
    $('connectionHint').textContent=d.configured?'API credentials detected':'Tambahkan secrets di Cloudflare';
  }catch(e){$('connection').textContent='Offline';$('connectionHint').textContent='Backend belum terpasang';}
}
$('sendForm').addEventListener('submit',async e=>{
  e.preventDefault(); const btn=$('sendButton'); btn.disabled=true; $('sendResult').textContent='Mengirim…';
  try{
    const r=await fetch('/api/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:$('phone').value.trim(),message:$('message').value.trim()})});
    const d=await r.json(); $('sendResult').textContent=r.ok?'Pesan diterima API. ID: '+(d.messageId||'terkirim'):'Gagal: '+(d.error||'Periksa konfigurasi');
  }catch(err){$('sendResult').textContent='Tidak dapat menghubungi backend.'}
  btn.disabled=false;
});
$('saveAutomation').addEventListener('click',()=>{
  localStorage.setItem('arzzbot-auto',JSON.stringify({enabled:$('autoReply').checked,reply:$('replyText').value}));
  $('automationResult').textContent='Pengaturan tersimpan di browser ini. Untuk penggunaan multi-admin, pindahkan ke database.';
});
try{const s=JSON.parse(localStorage.getItem('arzzbot-auto')||'{}');$('autoReply').checked=!!s.enabled;if(s.reply)$('replyText').value=s.reply;$('automationState').textContent=s.enabled?'Enabled':'Standby';$('autoReply').addEventListener('change',()=>{$('automationState').textContent=$('autoReply').checked?'Enabled':'Standby'});}catch(e){}
loadStatus();
