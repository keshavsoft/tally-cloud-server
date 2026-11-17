const F = {
  version: "v12.0.0",
  description: "build table from store data and render to DOM uses json-to-spec, json-to-dom under the hood"
}, S = (t) => {
  var e;
  typeof globalThis > "u" || !t || (globalThis.ks ?? (globalThis.ks = {}), (e = globalThis.ks).jsonRenderers ?? (e.jsonRenderers = {
    meta: F,
    renderToDom: t
  }));
}, D = {
  version: "v32",
  description: "JSON-to-DOM engine with centralized traversal and responsibility-focused construction"
}, G = ({ inFuncDefinition: t } = {}) => {
  if (typeof globalThis > "u" || !t) return;
  globalThis.ks ?? (globalThis.ks = {});
  const e = {
    meta: D,
    buildSpecElement: t
  };
  globalThis.ks.jsonToSpec = e;
}, z = (t, e) => d(t, e), b = (t, e) => Array.isArray(t) ? t.map((l) => z(l, e)).flat(1 / 0).filter(Boolean) : [], I = (t, e) => {
  if ("source" in t && (t == null ? void 0 : t.source) in e) {
    const l = e[t == null ? void 0 : t.source];
    if (Array.isArray(l))
      return l.map((n) => {
        const r = t == null ? void 0 : t.template;
        if (r)
          return d(r, n);
      });
  }
}, L = (t, e) => {
  let l = [];
  for (const [o, n] of Object.entries(e)) {
    const r = t == null ? void 0 : t.template;
    if (r) {
      const a = d(r, {
        key: o,
        value: n
      });
      l.push(a);
    }
  }
  return l;
}, R = (t, e) => {
  if ("source" in t && (t == null ? void 0 : t.source) in e) {
    const l = e[t == null ? void 0 : t.source];
    if (Array.isArray(l))
      return l.map((n) => {
        const r = t == null ? void 0 : t.template;
        if (r)
          return d(r, n);
      });
  }
}, M = (t, e) => {
  if ("operation" in t) {
    if (t.operation === "loopArray")
      return I(t, e);
    if (t.operation === "loopObject")
      return L(t, e);
    if (t.operation === "loopCollection")
      return R(t, e);
  }
}, m = (t, e) => {
  if (typeof e == "string") return e;
  if (typeof t != "string") return t;
  if (t === "${value}")
    return e.value;
  const l = t.match(/^\$\{(.+?)\}$/);
  if (l) {
    const o = l[1];
    return (e == null ? void 0 : e[o]) ?? "";
  }
  return t;
}, V = (t, e) => {
  let l = {};
  for (const [o, n] of Object.entries(t)) {
    const r = m(n, e);
    l[o] = r;
  }
  return l;
}, q = (t, e) => {
  if ("tagName" in t) {
    if ("textContent" in t) {
      const l = m(t.textContent, e);
      t.textContent = l;
    }
    if ("attributes" in t) {
      const l = V(t.attributes, e);
      t.attributes = l;
    }
  }
}, P = (t, e) => {
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const l = structuredClone(t);
  if (!l) return null;
  if ("tagName" in l && q(l, e), "jsonToSpec" in l) {
    const o = l == null ? void 0 : l.jsonToSpec, n = M(o, e);
    Array.isArray(n) ? l.children = n : l.children = [n], delete l.jsonToSpec;
  }
  if (Array.isArray(l == null ? void 0 : l.children)) {
    const o = b(l == null ? void 0 : l.children, e);
    l.children = o;
  }
  return l;
}, d = (t, e) => {
  if (t == null) return null;
  debugger;
  return typeof Node < "u" && t instanceof Node ? t : Array.isArray(t) ? b(t, e) : typeof t == "object" ? P(t, e) : typeof t == "string" || typeof t == "number" ? document.createTextNode(String(t)) : t;
}, y = (t, e) => d(t, e);
G({
  inFuncDefinition: y
});
const H = {
  version: "v9",
  description: "JSON-to-DOM engine with SVG namespace support, mixed text content, and centralized traversal"
}, B = ({ inFuncDefinition: t, inReviewSpec: e } = {}) => {
  if (typeof globalThis > "u" || !t) return;
  globalThis.ks ?? (globalThis.ks = {});
  const l = {
    meta: H,
    buildSpecElement: t,
    reviewSpec: e
  };
  globalThis.ks["json-to-tag"] = l, globalThis.ks.jsonToTag = l;
}, _ = (t) => t == null ? null : typeof Node < "u" && t instanceof Node ? t : typeof t == "string" || typeof t == "number" ? document.createTextNode(String(t)) : typeof t == "object" && (t.nodeType === 3 || t.tagName === "#text" || !t.tagName && (t.textContent !== void 0 || t.text !== void 0)) ? document.createTextNode(t.textContent ?? t.text ?? "") : T(t), p = (t) => Array.isArray(t) ? t.map(_).flat(1 / 0).filter(Boolean) : [], U = (t) => (t == null, t), K = "http://www.w3.org/2000/svg", X = /* @__PURE__ */ new Set([
  "svg",
  "path",
  "symbol",
  "use",
  "g",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "defs",
  "clippath",
  "mask",
  "pattern",
  "marker",
  "lineargradient",
  "radialgradient",
  "stop",
  "image",
  "filter",
  "fegaussianblur",
  "femerge",
  "femergenode"
]), Q = ({ inTagName: t }) => {
  const e = t == null ? void 0 : t.toLowerCase();
  if (!e) return null;
  if (e === "checkbox") {
    const l = document.createElement("input");
    return l.type = "checkbox", l;
  }
  return X.has(e) ? document.createElementNS(K, e) : document.createElement(e);
}, W = ({ inElement: t, inTextContent: e }) => (!t || e === void 0 || e === null || (t.textContent = e), t), Y = ({ inElement: t, inProperties: e }) => (t && e && typeof e == "object" && Object.assign(t, e), t), Z = "http://www.w3.org/1999/xlink", J = ({ inElement: t, inAttributes: e }) => {
  const l = t, o = e;
  if (!l || !o || typeof o != "object")
    return l;
  const n = typeof SVGElement < "u" ? l instanceof SVGElement : l.namespaceURI === "http://www.w3.org/2000/svg";
  return Object.entries(o).forEach(([r, a]) => {
    if (r === "class") {
      n ? l.setAttribute("class", String(a)) : l.className = a;
      return;
    }
    if (r === "xlink:href" || r === "href") {
      if (a != null) {
        const s = String(a);
        if (n)
          try {
            l.setAttributeNS(Z, "href", s);
          } catch {
          }
        l.setAttribute("href", s), l.setAttribute("xlink:href", s);
      }
      return;
    }
    if (typeof a == "boolean") {
      a ? l.setAttribute(r, "") : l.removeAttribute(r);
      return;
    }
    a != null && l.setAttribute(r, String(a));
  }), l;
}, tt = ({ inElement: t, inClassList: e }) => {
  if (!t || !e) return t;
  const l = typeof e == "string" ? e.split(/\s+/).filter(Boolean) : Array.isArray(e) ? e.filter((o) => typeof o == "string" && o.trim()) : [];
  return l.length && t.classList.add(...l), t;
}, et = (t) => {
  if (!t || typeof t != "object" || Array.isArray(t) || !t.tagName) return null;
  const e = Q({ inTagName: t.tagName });
  if (!e) return null;
  if (W({
    inElement: e,
    inTextContent: U(t.textContent),
    inTagName: t.tagName
  }), Y({
    inElement: e,
    inProperties: t.properties
  }), J({
    inElement: e,
    inAttributes: t.attributes
  }), tt({
    inElement: e,
    inClassList: t.classList
  }), Array.isArray(t.children)) {
    const l = p(t.children);
    l.length && e.append(...l);
  }
  return e;
}, T = (t) => t == null ? null : typeof Node < "u" && t instanceof Node ? t : Array.isArray(t) ? p(t) : typeof t == "object" ? et(t) : typeof t == "string" || typeof t == "number" ? document.createTextNode(String(t)) : null, lt = "./tags.schema.json", rt = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [
    "title",
    "role"
  ],
  childTags: []
}, ot = {
  allowsTextContent: !1,
  allowsChildren: !1,
  allowedAttributes: [
    "type",
    "placeholder",
    "value",
    "name",
    "disabled",
    "readonly",
    "required",
    "list"
  ]
}, nt = {
  allowsTextContent: !1,
  allowsChildren: !1,
  allowedAttributes: [
    "type",
    "checked",
    "name",
    "value",
    "disabled",
    "required"
  ]
}, at = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [
    "span"
  ],
  childTags: [
    "col"
  ]
}, st = {
  allowsTextContent: !1,
  allowsChildren: !1,
  allowedAttributes: [
    "span",
    "style",
    "width"
  ]
}, it = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [
    "for"
  ],
  childTags: []
}, ut = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [
    "action",
    "method",
    "autocomplete",
    "enctype",
    "name",
    "novalidate",
    "target"
  ],
  childTags: []
}, ct = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [
    "name",
    "disabled",
    "required",
    "multiple",
    "size"
  ],
  childTags: [
    "option"
  ]
}, dt = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: []
}, ft = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: []
}, ht = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: []
}, gt = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: []
}, wt = {
  allowsTextContent: !1,
  allowsChildren: !1,
  allowedAttributes: [
    "src",
    "alt",
    "width",
    "height",
    "loading"
  ]
}, bt = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [
    "type",
    "disabled",
    "name",
    "value"
  ],
  childTags: []
}, mt = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [
    "border",
    "cellpadding",
    "cellspacing"
  ],
  childTags: [
    "caption",
    "colgroup",
    "thead",
    "tbody",
    "tfoot",
    "tr"
  ]
}, yt = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: [
    "tr"
  ]
}, pt = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: [
    "tr"
  ]
}, Tt = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: [
    "tr"
  ]
}, Ct = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: [
    "td",
    "th"
  ]
}, At = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [
    "scope",
    "colspan",
    "rowspan"
  ],
  childTags: []
}, xt = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [
    "colspan",
    "rowspan"
  ],
  childTags: []
}, vt = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: [
    "option"
  ]
}, jt = {
  allowsTextContent: !0,
  allowsChildren: !1,
  allowedAttributes: [
    "value",
    "label",
    "selected",
    "disabled"
  ]
}, Nt = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [
    "role"
  ],
  childTags: []
}, kt = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [
    "href",
    "target",
    "rel",
    "title",
    "download"
  ],
  childTags: []
}, $t = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [
    "aria-hidden"
  ],
  childTags: []
}, Et = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [],
  childTags: []
}, Ot = {
  allowsTextContent: !1,
  allowsChildren: !0,
  allowedAttributes: [
    "type"
  ],
  childTags: [
    "li"
  ]
}, Ft = {
  allowsTextContent: !0,
  allowsChildren: !0,
  allowedAttributes: [
    "value"
  ],
  childTags: []
}, St = {
  allowsTextContent: !1,
  allowsChildren: !1,
  allowedAttributes: []
}, Dt = {
  $schema: lt,
  div: rt,
  input: ot,
  checkbox: nt,
  colgroup: at,
  col: st,
  label: it,
  form: ut,
  select: ct,
  p: dt,
  h1: ft,
  h2: ht,
  span: gt,
  img: wt,
  button: bt,
  table: mt,
  thead: yt,
  tbody: pt,
  tfoot: Tt,
  tr: Ct,
  th: At,
  td: xt,
  datalist: vt,
  option: jt,
  header: Nt,
  a: kt,
  i: $t,
  small: Et,
  ul: Ot,
  li: Ft,
  hr: St
}, h = ({ inSpec: t }) => {
  const e = t;
  if (!e) return [];
  if (Array.isArray(e))
    return e.flatMap((o) => h({ inSpec: o }));
  if (typeof e != "object") return [];
  const l = [];
  return typeof e.tagName == "string" && e.tagName.trim().length > 0 && l.push(e.tagName.toLowerCase()), Array.isArray(e.children) && e.children.length > 0 && e.children.forEach((o) => {
    const n = h({ inSpec: o });
    l.push(...n);
  }), l;
}, Gt = ({ inTagsFound: t, inAllowedTags: e }) => {
  const l = t ?? [], o = e ?? {}, n = new Set(
    Object.keys(o).filter((i) => i !== "$schema").map((i) => i.toLowerCase())
  ), r = {}, a = [], s = [];
  l.forEach((i) => {
    r[i] = (r[i] || 0) + 1, n.has(i) ? a.includes(i) || a.push(i) : s.includes(i) || s.push(i);
  });
  const u = l.length, c = s.length === 0;
  return {
    totalTags: u,
    tagCounts: r,
    uniqueTags: Object.keys(r),
    recognizedTags: a,
    unrecognizedTags: s,
    areAllTagsPresent: c
  };
}, zt = ({ inSpec: t, inTags: e = Dt } = {}) => {
  const l = t, o = e, n = h({ inSpec: l }), r = Gt({
    inTagsFound: n,
    inAllowedTags: o
  });
  return {
    areAllTagsPresent: r.areAllTagsPresent,
    totalTags: r.totalTags,
    tagCounts: r.tagCounts,
    uniqueTags: r.uniqueTags,
    recognizedTags: r.recognizedTags,
    unrecognizedTags: r.unrecognizedTags
  };
}, C = (t = {}) => {
  const e = (t == null ? void 0 : t.spec) ?? (t == null ? void 0 : t.inSpec) ?? t;
  return T(e);
};
B({
  inFuncDefinition: C,
  inReviewSpec: zt
});
const It = {
  default: {
    tagName: "table",
    attributes: {
      class: "table table-hover table-striped mb-0"
    },
    children: [
      {
        tagName: "thead",
        children: [
          {
            tagName: "tr",
            jsonToSpec: {
              operation: "loopCollection",
              source: "columns",
              template: {
                tagName: "th",
                textContent: "${title}"
              }
            },
            children: []
          }
        ]
      },
      {
        tagName: "tbody",
        jsonToSpec: {
          operation: "loopCollection",
          source: "data",
          template: {
            tagName: "tr",
            jsonToSpec: {
              operation: "loopObject",
              source: "data",
              template: {
                tagName: "td",
                textContent: "${value}"
              }
            },
            children: []
          }
        },
        children: []
      }
    ]
  }
}, Lt = ({
  targetHtmlId: t,
  inTargetHtmlId: e,
  inColumns: l,
  inData: o
} = {}) => {
  const n = e ?? t, r = o ?? [], a = l;
  let s = y(It.default, {
    columns: a,
    data: r
  });
  "tagName" in s || (s = s.children);
  const u = document.getElementById(n);
  u && (u.innerHTML = "");
  const c = C(s);
  u.append(c);
}, w = {
  table: Lt
}, Rt = ({
  type: t = "table",
  targetHtmlId: e,
  data: l,
  classToApply: o,
  inTargetHtmlId: n,
  inData: r,
  columns: a,
  inColumns: s,
  colGroup: u,
  inColGroup: c,
  footerData: i,
  inFooterData: A,
  config: x,
  inConfig: v,
  variant: j,
  skeletonType: N,
  inSkeletonType: k,
  showLog: $ = !1,
  inShowLog: E
} = {}) => {
  const f = t, O = typeof f == "string" ? f.toLowerCase() : "table", g = w[O];
  return g ? g({
    targetHtmlId: n ?? e,
    inColumns: s ?? a,
    inData: r ?? l,
    inColGroup: c ?? u,
    inFooterData: A ?? i ?? [],
    inConfig: v ?? x ?? {},
    inSkeletonType: k ?? N ?? j ?? "default",
    inShowLog: E ?? $ ?? !1
  }) : (console.error(
    `[Renderer] Unknown renderer type "${f}". Available types: ${Object.keys(w).join(", ")}`
  ), null);
};
S(Rt);
export {
  Rt as default
};
