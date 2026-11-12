/**
 * Champagne caustics — sunlight dancing through shallow water — as a tiny WebGL fragment shader.
 * Rendered at half resolution (it's a soft shimmer: nobody sees the pixels, the GPU does 4× less work),
 * paused off-screen, and drawn once (still frame) on low-power devices or with reduced motion.
 */
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
const FS = `precision mediump float;
uniform vec2 r; uniform float t;
float caustic(vec2 uv){
  vec2 p = mod(uv * 6.2831, 6.2831) - 250.;
  vec2 i = p; float c = 1., inten = .005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1. - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1. / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.; c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.);
}
void main(){
  vec2 uv = gl_FragCoord.xy / r.y * .55;
  float v = clamp(caustic(uv), 0., 1.);
  vec3 ivory = vec3(.98, .973, .957), gold = vec3(.75, .627, .416);
  gl_FragColor = vec4(mix(ivory, gold, v * .55), v * .5);
}`

export function startCaustics(
  canvas: HTMLCanvasElement,
  { animate, observe }: { animate: boolean; observe: (el: Element, cb: (v: boolean) => void) => () => void },
) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false, powerPreference: 'low-power' })
  if (!gl) return () => {}
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
  const pr = gl.createProgram()!
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS))
  gl.linkProgram(pr); gl.useProgram(pr)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't')
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const SCALE = 0.5
  let time = 12
  const frame = () => { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(uT, time); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) }
  const size = () => {
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * SCALE))
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * SCALE))
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(uR, canvas.width, canvas.height)
    frame()
  }
  size()
  const ro = new ResizeObserver(size); ro.observe(canvas)
  if (!animate) return () => ro.disconnect()

  let visible = true, raf = 0, last = performance.now()
  const off = observe(canvas, v => { visible = v; last = performance.now() })
  const loop = (now: number) => {
    if (visible && !document.hidden) { time += Math.min(now - last, 50) * 0.00035; frame() }
    last = now
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => { cancelAnimationFrame(raf); off(); ro.disconnect() }
}
