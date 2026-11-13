/**
 * ============================================
 *  Polyfill for expo-gl and Three.js (r163+)
 *  1. Guarantees getProgramInfoLog and getShaderInfoLog return a string (prevents .trim() crash).
 *  2. Prevents Three.js r163+ error: "THREE.WebGLRenderer: WebGL 1 is not supported since r163."
 * ============================================
 */

export function patchGLContext(gl: any) {
  if (!gl || gl.__trimPolyfilled) return;
  gl.__trimPolyfilled = true;

  const origGetProgramInfoLog = gl.getProgramInfoLog;
  gl.getProgramInfoLog = function (program: any) {
    try {
      const res = origGetProgramInfoLog ? origGetProgramInfoLog.call(this, program) : "";
      return typeof res === "string" ? res : "";
    } catch {
      return "";
    }
  };

  const origGetShaderInfoLog = gl.getShaderInfoLog;
  gl.getShaderInfoLog = function (shader: any) {
    try {
      const res = origGetShaderInfoLog ? origGetShaderInfoLog.call(this, shader) : "";
      return typeof res === "string" ? res : "";
    } catch {
      return "";
    }
  };

  if (!gl.getContextAttributes) {
    gl.getContextAttributes = () => ({
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
  }

  const origGetParameter = gl.getParameter?.bind(gl);
  if (origGetParameter) {
    gl.getParameter = function (param: number) {
      try {
        const val = origGetParameter(param);
        if (param === (gl.VERSION || 0x1F02)) {
          return typeof val === "string" && val.length > 0 ? val : "WebGL 2.0 (OpenGL ES 3.0)";
        }
        return val;
      } catch {
        if (param === (gl.VERSION || 0x1F02)) {
          return "WebGL 2.0 (OpenGL ES 3.0)";
        }
        return null;
      }
    };
  }
}

// ── Disable false-positive "WebGL 1 is not supported since r163" check ──
const suppressWebGL1Error = (target: any) => {
  if (target && typeof target === "function") {
    try {
      Object.defineProperty(target, Symbol.hasInstance, {
        value: () => false,
        configurable: true,
      });
    } catch {}
  }
};

if (typeof WebGLRenderingContext !== "undefined") {
  suppressWebGL1Error(WebGLRenderingContext);
}
if (typeof global !== "undefined") {
  if ((global as any).WebGLRenderingContext) {
    suppressWebGL1Error((global as any).WebGLRenderingContext);
  }
}

// ── Intercept global.__EXGLContexts ──
if (typeof global !== "undefined") {
  let contexts: Record<string, any> = (global as any).__EXGLContexts || {};

  try {
    Object.defineProperty(global, "__EXGLContexts", {
      configurable: true,
      enumerable: true,
      get() {
        return contexts;
      },
      set(newContexts) {
        if (newContexts && typeof newContexts === "object") {
          contexts = new Proxy(newContexts, {
            set(target, prop, val) {
              if (val && typeof val === "object") {
                patchGLContext(val);
              }
              return Reflect.set(target, prop, val);
            },
          });
          Object.values(contexts).forEach(patchGLContext);
        } else {
          contexts = newContexts;
        }
      },
    });

    if ((global as any).__EXGLContexts) {
      (global as any).__EXGLContexts = (global as any).__EXGLContexts;
    }
  } catch {
    // ignore if defineProperty not permitted
  }
}
