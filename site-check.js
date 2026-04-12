(function(){
  var m = window.location.pathname.match(/\/associates\/([^/]+)/);
  var s = m ? m[1] : '';
  if (!s) return;
  var api = (window.CONFIG && (window.CONFIG.apiBaseUrl || window.CONFIG.apiUrl)) || 'http://localhost:3000';
  fetch(api.replace(/\/$/,'') + '/api/public/associates/' + s).then(function(r){return r.json()}).then(function(res){
    if (res.data && res.data.siteConfigured === false) {
      document.open();
      document.write('<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>En configuraci\u00f3n</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5"><div style="text-align:center;padding:2rem"><h1 style="color:#666">P\u00e1gina en configuraci\u00f3n</h1><p>Estamos preparando tu sitio. Pronto estar\u00e1 disponible.</p></div></body></html>');
      document.close();
    }
  }).catch(function(){});
})();
