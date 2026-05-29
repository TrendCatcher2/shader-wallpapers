// Minimal WebGL fragment-shader runner used by all wallpapers.
// Each wallpaper supplies a fragment shader string + optional uniforms.
// Tracks mouse (smoothed + raw), click ripples, time, and resolution.
//
//   ShaderWallpaper.mount({
//     canvas: document.querySelector('canvas'),
//     fragment: '...',
//     uniforms: { uTint: { type: '3f', value: [0,1,0.4] } },
//     onTick: (gl, t) => { ... },         // optional per-frame hook
//   });

(function () {
  const VERT = `
    attribute vec2 a;
    void main(){ gl_Position = vec4(a, 0.0, 1.0); }
  `;

  const COMMON_HEADER = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform vec2  uMouse;        // smoothed, in pixels (origin bottom-left)
    uniform vec2  uMouseRaw;     // raw, in pixels
    uniform float uMouseDown;    // 0 or 1
    uniform vec4  uClicks[8];    // xy = pos px, z = time of click, w = strength
  `;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      console.error(src);
      throw new Error('shader compile');
    }
    return s;
  }

  function mount({ canvas, fragment, uniforms = {}, onTick }) {
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) { console.error('no webgl'); return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, COMMON_HEADER + '\n' + fragment));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res:       gl.getUniformLocation(prog, 'uRes'),
      time:      gl.getUniformLocation(prog, 'uTime'),
      mouse:     gl.getUniformLocation(prog, 'uMouse'),
      mouseRaw:  gl.getUniformLocation(prog, 'uMouseRaw'),
      mouseDown: gl.getUniformLocation(prog, 'uMouseDown'),
      clicks:    gl.getUniformLocation(prog, 'uClicks'),
    };
    const customLocs = {};
    for (const k of Object.keys(uniforms)) {
      customLocs[k] = gl.getUniformLocation(prog, k);
    }

    function setUniform(loc, def) {
      if (loc == null) return;
      const v = def.value;
      switch (def.type) {
        case '1f': gl.uniform1f(loc, v); break;
        case '2f': gl.uniform2f(loc, v[0], v[1]); break;
        case '3f': gl.uniform3f(loc, v[0], v[1], v[2]); break;
        case '4f': gl.uniform4f(loc, v[0], v[1], v[2], v[3]); break;
        case '1i': gl.uniform1i(loc, v); break;
      }
    }

    // input
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, down: 0 };
    const clicks = new Float32Array(8 * 4);
    let clickIdx = 0;

    function ptr(e) {
      const r = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      const px = (t.clientX - r.left) * (canvas.width / r.width);
      const py = canvas.height - (t.clientY - r.top) * (canvas.height / r.height);
      mouse.x = px; mouse.y = py;
    }
    canvas.addEventListener('mousemove', ptr);
    canvas.addEventListener('touchmove', (e) => { ptr(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('mousedown', (e) => {
      ptr(e); mouse.down = 1;
      const i = clickIdx % 8;
      clicks[i*4+0] = mouse.x;
      clicks[i*4+1] = mouse.y;
      clicks[i*4+2] = performance.now() / 1000;
      clicks[i*4+3] = 1.0;
      clickIdx++;
    });
    window.addEventListener('mouseup', () => { mouse.down = 0; });
    canvas.addEventListener('touchstart', (e) => {
      ptr(e); mouse.down = 1;
      const i = clickIdx % 8;
      clicks[i*4+0] = mouse.x;
      clicks[i*4+1] = mouse.y;
      clicks[i*4+2] = performance.now() / 1000;
      clicks[i*4+3] = 1.0;
      clickIdx++;
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', () => { mouse.down = 0; });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        // default mouse to center on first sizing
        if (mouse.x === 0 && mouse.y === 0) { mouse.x = w/2; mouse.y = h/2; mouse.sx = w/2; mouse.sy = h/2; }
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const t0 = performance.now();
    function frame() {
      resize();
      const t = (performance.now() - t0) / 1000;
      // smooth mouse
      mouse.sx += (mouse.x - mouse.sx) * 0.12;
      mouse.sy += (mouse.y - mouse.sy) * 0.12;

      gl.useProgram(prog);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      gl.uniform2f(u.mouse, mouse.sx, mouse.sy);
      gl.uniform2f(u.mouseRaw, mouse.x, mouse.y);
      gl.uniform1f(u.mouseDown, mouse.down);
      if (u.clicks) gl.uniform4fv(u.clicks, clicks);

      for (const k of Object.keys(uniforms)) {
        setUniform(customLocs[k], uniforms[k]);
      }

      if (onTick) onTick(gl, t);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(frame);
    }
    frame();
    return { gl, prog, uniforms, canvas };
  }

  window.ShaderWallpaper = { mount };
})();
