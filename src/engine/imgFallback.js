/* Ported verbatim from the pre-React inline <script> of 3ok 3/localtour.directory/cities/chicago/index.html (lines 1600-1635).
   WS1 css-extract — global <img> error fallback + rdProbeBackgrounds() CSS background probe; logic unchanged. */

let installed = null;

export function installImgFallback() {
  if (installed) return installed;

  function onImgError(e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.dataset.fallback) {
      t.dataset.fallback = '1';
      var palette = ['#1c2530','#2a1a14','#1a2820','#2a2218','#1c1a24','#241820','#1f2424','#28201a'];
      var hash = 0, src = t.getAttribute('src') || '';
      for (var i = 0; i < src.length; i++) hash = (hash*31 + src.charCodeAt(i)) & 0xffffffff;
      var c = palette[Math.abs(hash) % palette.length];
      var w = t.naturalWidth || 800, h = t.naturalHeight || 600;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'"><rect width="100%" height="100%" fill="'+c+'"/></svg>';
      t.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }
  }

  function rdProbeBackgrounds() {
    document.querySelectorAll('[style*="background-image"]').forEach(function(el){
      if (el.dataset.bgChecked) return;
      var s = el.getAttribute('style') || '';
      var m = s.match(/url\(([^)]+)\)/);
      if (!m) return;
      var url = m[1].replace(/^["']|["']$/g, '');
      if (!/images\//.test(url)) return;
      el.dataset.bgChecked = '1';
      var probe = new Image();
      probe.onerror = function(){
        var palette = ['#1c2530','#2a1a14','#1a2820','#2a2218','#1c1a24','#241820','#1f2424','#28201a'];
        var hash = 0; for (var i = 0; i < url.length; i++) hash = (hash*31 + url.charCodeAt(i)) & 0xffffffff;
        var c = palette[Math.abs(hash) % palette.length];
        el.style.backgroundImage = 'linear-gradient(135deg, ' + c + ', #0a0a0b)';
      };
      probe.src = url;
    });
  }

  document.addEventListener('error', onImgError, true);
  window.addEventListener('load', rdProbeBackgrounds);
  var intervalId = setInterval(rdProbeBackgrounds, 1000);

  installed = function cleanup() {
    document.removeEventListener('error', onImgError, true);
    window.removeEventListener('load', rdProbeBackgrounds);
    clearInterval(intervalId);
    installed = null;
  };
  return installed;
}
