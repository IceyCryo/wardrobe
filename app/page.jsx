"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, GizmoHelper, GizmoViewport, Grid, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

const MM = 0.25;
const SNAP = 32;
const colorChoices = [
  {name:"Graphite",value:"#69737d"},
  {name:"White",value:"#d9dde0"},
  {name:"Oak",value:"#b88a5a"},
  {name:"Walnut",value:"#76533f"},
  {name:"Sage",value:"#738877"},
  {name:"Navy",value:"#536b84"},
  {name:"Cashmere",value:"#c8bca9"},
];
const catalog = [
  { type: "shelf", name: "Shelf", meta: "18 mm panel", glyph: "═" },
  { type: "rail", name: "Clothes rail", meta: "Round Ø25 mm", glyph: "⌒" },
  { type: "drawer", name: "Drawer", meta: "Stackable front", glyph: "▤" },
  { type: "basket", name: "Wire basket", meta: "Pull-out", glyph: "▥" },
  { type: "cubby", name: "Cubby grid", meta: "Rows × columns", glyph: "▦" },
  { type: "shoe", name: "Shoe shelf", meta: "Angled 12°", glyph: "≋" },
  { type: "mirror", name: "Mirror", meta: "4 selectable shapes", glyph: "◇" },
  { type: "led", name: "LED profile", meta: "Vertical / horizontal", glyph: "│" },
  { type: "divider", name: "Vertical divider", meta: "Custom panel", glyph: "┃" },
];

const seedSections = [
  {
    id: "s1", width: 800, items: [
      { id: "i1", type: "shelf", y: 380, h: 18, width: 760 },
      { id: "i2", type: "shelf", y: 820, h: 18, width: 760 },
      { id: "i3", type: "cubby", y: 1450, h: 520, width: 760, rows: 2, columns: 2 },
    ],
  },
  {
    id: "s2", width: 1000, items: [
      { id: "i4", type: "rail", y: 360, h: 40, width: 940 },
      { id: "i5", type: "drawer", y: 1540, h: 520, width: 940, drawers: 3 },
    ],
  },
  {
    id: "s3", width: 600, items: [
      { id: "i6", type: "shelf", y: 320, h: 18, width: 560 },
      { id: "i7", type: "shelf", y: 650, h: 18, width: 560 },
      { id: "i8", type: "shelf", y: 980, h: 18, width: 560 },
      { id: "i9", type: "shoe", y: 1450, h: 480, width: 560, rows: 3 },
    ],
  },
];

const cloneSections = (prefix) => seedSections.slice(0, 2).map((section, a) => ({
  ...section,
  id: `${prefix}-s${a}`,
  width: a ? 900 : 700,
  items: section.items.slice(0, 2).map((item, b) => ({ ...item, id: `${prefix}-i${a}-${b}`, x: 20, width: Math.min(item.width, (a ? 900 : 700) - 40) })),
}));

function I({ name, size = 18 }) {
  const d = {
    select: <><path d="m5 3 11 8-6 1-3 6z"/><path d="m10 12 4 5"/></>,
    hand: <><path d="M7 11V6a1.5 1.5 0 013 0v4M10 9V5a1.5 1.5 0 013 0v5M13 9V6a1.5 1.5 0 013 0v6M7 10 5.8 8.8a1.4 1.4 0 00-2 2l4.5 6.2a4 4 0 003.2 1.6H14a4 4 0 004-4V9a1.5 1.5 0 00-2-1.5"/></>,
    undo: <><path d="m9 7-4 4 4 4"/><path d="M5 11h8a5 5 0 015 5"/></>,
    redo: <><path d="m15 7 4 4-4 4"/><path d="M19 11h-8a5 5 0 00-5 5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    minus: <path d="M5 12h14"/>,
    fit: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></>,
    cube: <><path d="m4 7 8-4 8 4-8 4z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4zM12 11v10"/></>,
    front: <><rect x="4" y="3" width="16" height="18"/><path d="M12 3v18"/></>,
    plan: <><path d="M4 4h16v16H4zM10 4v16M10 12h10"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
    copy: <><rect x="8" y="8" width="11" height="12"/><path d="M16 8V4H4v12h4"/></>,
    export: <><path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/></>,
    eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12"/><circle cx="12" cy="12" r="2.5"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="1"/><path d="M8 10V7a4 4 0 018 0v3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 00-1.8-1L14.4 3h-4.8l-.3 3.1a7 7 0 00-1.8 1l-2.4-1-2 3.4L5.1 11a7 7 0 000 2l-2 1.5 2 3.4 2.4-1a7 7 0 001.8 1l.3 3.1h4.8l.3-3.1a7 7 0 001.8-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d[name]}</svg>;
}

function NumberField({ label, value, unit = "mm", onChange, min = 0, max = Infinity, step = 10 }) {
  const [draft, setDraft] = useState(String(Math.round(value)));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(String(Math.round(value)));
  }, [value, editing]);

  const commit = () => {
    const parsed = Number(draft);
    const next = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : value;
    onChange(next);
    setDraft(String(Math.round(next)));
    setEditing(false);
  };

  return <label className="num-field"><span>{label}</span><div><input
    type="text"
    inputMode="decimal"
    value={draft}
    onFocus={e => { setEditing(true); e.currentTarget.select(); }}
    onChange={e => setDraft(e.target.value)}
    onBlur={commit}
    onKeyDown={e => {
      if (e.key === "Enter") { e.preventDefault(); commit(); e.currentTarget.blur(); }
      if (e.key === "Escape") { setDraft(String(Math.round(value))); setEditing(false); e.currentTarget.blur(); }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const base = Number.isFinite(Number(draft)) ? Number(draft) : value;
        const next = Math.min(max, Math.max(min, base + (e.key === "ArrowUp" ? step : -step)));
        setDraft(String(next));
      }
    }}
  /><i>{unit}</i></div></label>;
}

function ColorChoices({ value, onChange, label }) {
  return <div className="color-field"><span>{label}</span><div className="color-swatches">
    {colorChoices.map(choice=><button
      key={choice.value}
      className={value===choice.value?"active":""}
      style={{"--swatch":choice.value}}
      onClick={()=>onChange(choice.value)}
      title={choice.name}
      aria-label={`${label}: ${choice.name}`}
    ><i/></button>)}
  </div></div>;
}

function cubbyBreaks(item, axis) {
  const count=axis==="row"?(item.rows||2):(item.columns||2);
  const total=axis==="row"?item.h:item.width;
  const saved=axis==="row"?item.rowBreaks:item.columnBreaks;
  if(Array.isArray(saved)&&saved.length===count-1)return saved.map(value=>Math.max(1,Math.min(total-1,value))).sort((a,b)=>a-b);
  return Array.from({length:count-1},(_,index)=>total*(index+1)/count);
}

function cubbyTracks(item, axis) {
  const total=axis==="row"?item.h:item.width;
  const points=[0,...cubbyBreaks(item,axis),total];
  return points.slice(1).map((point,index)=>Math.max(1,point-points[index]));
}

function Fitting({ item, selected, scale, xScale = scale, onSelect, onPointerDown }) {
  const common = {
    className: `fitting fit-${item.type} ${selected ? "selected" : ""}`,
    style: {
      top: item.y * scale,
      height: Math.max(item.h * scale, item.type === "shelf" ? 6 : 10),
      left: (item.x ?? 20) * xScale,
      width: Math.max(12, item.width * xScale),
    },
    onPointerDown, onClick: e => { e.stopPropagation(); onSelect(); },
  };
  if (item.type === "shelf") return <div {...common}><span className="depth-face"/></div>;
  if (item.type === "rail") return <div {...common}><span className="rail-tube"/>{[.23,.5,.76].map((x,n)=><i className="hanger" key={x} style={{left:`${x*100}%`}}><b style={{background:["#71849a","#9a7567","#7a8a73"][n]}}/></i>)}</div>;
  if (item.type === "drawer") return <div {...common}><div className="drawer-stack">{Array.from({length:item.drawers || 3}).map((_,i)=><i key={i}><b/></i>)}</div></div>;
  if (item.type === "basket") return <div {...common}><span className="basket-mesh"/></div>;
  if (item.type === "cubby") return <div {...common}><span className="cubby-grid" style={{gridTemplateColumns:cubbyTracks(item,"column").map(value=>`${value}fr`).join(" "),gridTemplateRows:cubbyTracks(item,"row").map(value=>`${value}fr`).join(" "),columnGap:`${Math.max(1,(item.columnGap??20)*scale)}px`,rowGap:`${Math.max(1,(item.rowGap??20)*scale)}px`,padding:`${Math.max(1,(item.frameThickness??25)*scale)}px`}}>{Array.from({length:(item.rows||2)*(item.columns||2)}).map((_,i)=><i key={i}/>)}</span></div>;
  if (item.type === "shoe") return <div {...common}><span className="shoe-set">{Array.from({length:item.rows || 3}).map((_,i)=><i key={i}/>)}</span></div>;
  if (item.type === "mirror") return <div {...common}><span className="mirror-pane"/></div>;
  if (item.type === "divider") return <div {...common}><span className="vertical-divider"/></div>;
  return <div {...common}><span className="led-line"/></div>;
}

function PrintFitting({ item, itemIndex, section, dimensions }) {
  const typeLabel=item.type.replace("-"," ");
  const common={
    "data-label":`${String(itemIndex+1).padStart(2,"0")} ${typeLabel}`,
    className:`print-fitting p-${item.type} ${item.variant?`variant-${item.variant}`:""}`,
    style:{
      top:`${item.y/dimensions.height*100}%`,
      height:`${Math.max(1,item.h/dimensions.height*100)}%`,
      left:`${(item.x??20)/section.width*100}%`,
      width:`${Math.min(item.width,section.width-20)/section.width*100}%`,
      "--fitting-color":item.color||"#69737d",
    },
    title:typeLabel,
  };
  if(item.type==="rail")return <i {...common}><span className="print-rail-garments">▽　▽　▽</span></i>;
  if(item.type==="drawer")return <i {...common}>{Array.from({length:item.drawers||3}).map((_,index)=><span className="print-drawer-front" key={index}/>)}</i>;
  if(item.type==="cubby")return <i {...common}><span className="print-cubby-grid" style={{gridTemplateColumns:cubbyTracks(item,"column").map(value=>`${value}fr`).join(" "),gridTemplateRows:cubbyTracks(item,"row").map(value=>`${value}fr`).join(" ")}}>{Array.from({length:(item.rows||2)*(item.columns||2)}).map((_,index)=><b key={index}/>)}</span></i>;
  if(item.type==="shoe")return <i {...common}>{Array.from({length:item.rows||3}).map((_,index)=><span className="print-shoe-rack" key={index}/>)}</i>;
  return <i {...common}/>;
}

function EditableRun({ run, sections, height, scale, selection, onSelectSection, onSelectItem, onStartItemDrag, onStartDividerDrag, side = false }) {
  const total = sections.reduce((sum, section) => sum + section.width, 0);
  return <div className={`run-interior ${side ? "side-run-interior" : ""}`}>
    {sections.map((section, index) => <div
      className={`cab-section ${selection?.sectionId === section.id && selection.run === run ? "selected" : ""}`}
      key={section.id}
      style={{ width: `${section.width / total * 100}%` }}
      onClick={e => { e.stopPropagation(); onSelectSection(run, section.id); }}
    >
      <span className="section-tag">{Math.round(section.width)}</span>
      {section.items.map(item => <Fitting
        key={item.id}
        item={item}
        scale={scale}
        xScale={side ? scale * .68 : scale}
        selected={selection?.itemId === item.id}
        onSelect={() => onSelectItem(run, section.id, item.id)}
        onPointerDown={e => onStartItemDrag(e, run, section, item)}
      />)}
      {index < sections.length - 1 && <button className="divider-handle" onPointerDown={e => onStartDividerDrag(e, run, index, side ? 0.68 : 1)} title="Drag to resize adjacent sections"><i/><i/><i/></button>}
    </div>)}
  </div>;
}

function CameraRig({ view, shape, preset }) {
  const { camera } = useThree();
  useEffect(() => {
    const wide=shape==="u"||shape==="left"||shape==="right";
    const homes = {
      home: wide?[.9,3.8,8.8]:[.8,3.25,7.4],
      left: wide?[-5.8,3.5,7.4]:[-4.6,3.2,6.4],
      right: wide?[5.8,3.5,7.4]:[4.6,3.2,6.4],
    };
    const positions = { "3d": homes[preset.name]||homes.home, front: [0, 2.1, wide?9.5:8.5], plan: [.01,wide?10:8,.01] };
    camera.up.set(0,view==="plan"?0:1,view==="plan"?-1:0);
    camera.position.set(...positions[view]);
    camera.lookAt(0, 1.15, wide ? .7 : .1);
    camera.updateProjectionMatrix();
  }, [camera, view, shape, preset]);
  return null;
}

function CameraKeyboardControls({ enabled }) {
  const {camera,controls}=useThree();
  const keys=useRef(new Set());
  const lastPress=useRef({w:0,s:0});
  const verticalMove=useRef(null);
  const forward=useMemo(()=>new Vector3(),[]);
  const right=useMemo(()=>new Vector3(),[]);
  const movement=useMemo(()=>new Vector3(),[]);
  const lookDirection=useMemo(()=>new Vector3(),[]);
  const worldUp=useMemo(()=>new Vector3(0,1,0),[]);

  useEffect(()=>{
    const down=e=>{
      if(["INPUT","SELECT","TEXTAREA"].includes(document.activeElement?.tagName))return;
      const key=e.key.toLowerCase();
      if(["w","a","s","d","shift"].includes(key)){
        if(!e.repeat&&(key==="w"||key==="s")&&!e.shiftKey){
          const now=performance.now();
          verticalMove.current=now-lastPress.current[key]<320?key:null;
          lastPress.current[key]=now;
        }
        keys.current.add(key);
        if(["w","a","s","d"].includes(key))e.preventDefault();
      }
    };
    const up=e=>{
      const key=e.key.toLowerCase();
      keys.current.delete(key);
      if(verticalMove.current===key)verticalMove.current=null;
    };
    const clear=()=>{keys.current.clear();verticalMove.current=null};
    window.addEventListener("keydown",down);
    window.addEventListener("keyup",up);
    window.addEventListener("blur",clear);
    return()=>{
      window.removeEventListener("keydown",down);
      window.removeEventListener("keyup",up);
      window.removeEventListener("blur",clear);
    };
  },[]);

  useFrame((_,delta)=>{
    if(!enabled||!controls)return;
    const looking=keys.current.has("shift");
    if(looking&&["w","a","s","d"].some(key=>keys.current.has(key))){
      lookDirection.copy(controls.target).sub(camera.position);
      const distance=lookDirection.length();
      if(distance<.001)return;
      right.set(1,0,0).applyQuaternion(camera.quaternion).normalize();
      const angle=1.15*delta;
      if(keys.current.has("a"))lookDirection.applyAxisAngle(worldUp,angle);
      if(keys.current.has("d"))lookDirection.applyAxisAngle(worldUp,-angle);
      if(keys.current.has("w"))lookDirection.applyAxisAngle(right,angle);
      if(keys.current.has("s"))lookDirection.applyAxisAngle(right,-angle);
      lookDirection.setLength(distance);
      controls.target.copy(camera.position).add(lookDirection);
      controls.update();
      return;
    }
    movement.set(0,0,0);
    if(verticalMove.current==="w"&&keys.current.has("w"))movement.add(worldUp);
    else if(verticalMove.current==="s"&&keys.current.has("s"))movement.sub(worldUp);
    else {
    camera.getWorldDirection(forward);
    forward.y=0;
    if(forward.lengthSq()<.0001)return;
    forward.normalize();
    right.copy(forward).cross(camera.up).normalize();
    if(keys.current.has("w"))movement.add(forward);
    if(keys.current.has("s"))movement.sub(forward);
    if(keys.current.has("d"))movement.add(right);
    if(keys.current.has("a"))movement.sub(right);
    }
    if(!movement.lengthSq())return;
    movement.normalize().multiplyScalar(1.5*delta);
    camera.position.add(movement);
    controls.target.add(movement);
    controls.update();
  });
  return null;
}

function Panel({ position, size, color = "#66717b", onClick }) {
  return <mesh position={position} castShadow receiveShadow onClick={onClick}>
    <boxGeometry args={size}/>
    <meshStandardMaterial color={color} roughness={.68} metalness={.04}/>
  </mesh>;
}

function WireBar({ position, size, selected, color }) {
  return <mesh position={position} castShadow>
    <boxGeometry args={size}/>
    <meshStandardMaterial color={selected?"#69aaff":color||"#9ca8b2"} metalness={.78} roughness={.24}/>
  </mesh>;
}

function HangingGarment({ x, y, color, selected, long = false }) {
  return <group position={[x,y,0]}>
    <mesh position={[0,-.055,.08]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[.026,.005,8,18,Math.PI*1.55]}/><meshStandardMaterial color="#b8c0c6" metalness={.8}/></mesh>
    <WireBar position={[0,-.115,.08]} size={[.008,.11,.008]} selected={selected}/>
    <mesh position={[0,-.175,.08]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.008,.2,.008]}/><meshStandardMaterial color="#aeb6bc" metalness={.75}/></mesh>
    <mesh position={[0,-.175,.08]} rotation={[0,0,-Math.PI/4]}><boxGeometry args={[.008,.2,.008]}/><meshStandardMaterial color="#aeb6bc" metalness={.75}/></mesh>
    <group position={[0,long?-.41:-.33,.075]}>
      <mesh castShadow><boxGeometry args={[long?.18:.22,long?.48:.3,.075]}/><meshStandardMaterial color={color} roughness={.9}/></mesh>
      <mesh position={[-.135,long?.15:.07,0]} rotation={[0,0,-.3]} castShadow><boxGeometry args={[.09,long?.28:.2,.065]}/><meshStandardMaterial color={color} roughness={.9}/></mesh>
      <mesh position={[.135,long?.15:.07,0]} rotation={[0,0,.3]} castShadow><boxGeometry args={[.09,long?.28:.2,.065]}/><meshStandardMaterial color={color} roughness={.9}/></mesh>
      <mesh position={[0,long?.235:.145,.041]}><torusGeometry args={[.035,.012,8,20,Math.PI]}/><meshStandardMaterial color="#252a2e" roughness={1}/></mesh>
    </group>
  </group>;
}

function Fitting3D({ item, sectionWidth, height, depth, xCenter, selected, onSelect }) {
  const w = Math.min(item.width, sectionWidth - 36) / 1000;
  const h = Math.max(item.h, item.type === "shelf" ? 18 : 35) / 1000;
  const d = Math.min(item.depth || depth - 70, depth - 45) / 1000;
  const x = xCenter - sectionWidth / 2000 + (item.x ?? 20) / 1000 + w / 2;
  const y = height / 1000 - item.y / 1000 - h / 2;
  const itemColor=item.color||"#69737d";
  const edge = selected ? "#4b9cff" : itemColor;
  const click = e => { e.stopPropagation(); onSelect(); };
  if (item.type === "rail") return <group onClick={click}>
    <mesh position={[x,y,.08]} rotation={[0,0,Math.PI/2]} castShadow>
      <cylinderGeometry args={[.017,.017,w,24]}/><meshStandardMaterial color={selected ? "#69aaff" : itemColor} metalness={.75} roughness={.24}/>
    </mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[x+side*w/2,y,.08]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.032,.032,.028,24]}/><meshStandardMaterial color="#8e989f" metalness={.85} roughness={.18}/></mesh>
      <Panel position={[x+side*w/2,y,.012]} size={[.075,.075,.025]} color={selected?"#477db7":"#707981"}/>
    </group>)}
    {[.22,.5,.78].map((v,i)=><HangingGarment key={v} x={x-w/2+w*v} y={y} color={["#70879a","#9d7364","#788b75"][i]} selected={selected} long={i===1}/>) }
  </group>;
  if (item.type === "drawer") return <group onClick={click}>{Array.from({length:item.drawers||3}).map((_,i)=>{
    const each=item.h/1000/(item.drawers||3); return <group key={i}>
      <Panel position={[x,y-h/2+each*(i+.5),.06]} size={[w-.018,each-.012,d]} color={selected?"#577da8":itemColor}/>
      <Panel position={[x,y-h/2+each*(i+.5),d/2+.065]} size={[w-.035,.012,.025]} color="#c3c9ce"/>
    </group>;
  })}</group>;
  if (item.type === "cubby") {
    const rows=item.rows||2, cols=item.columns||2;
    const columnThickness=Math.min(.2,Math.max(.005,(item.columnGap??20)/1000));
    const rowThickness=Math.min(.2,Math.max(.005,(item.rowGap??20)/1000));
    const frameThickness=Math.min(.2,(item.frameThickness||25)/1000);
    const inset=Math.min(d-.05,(item.depthInset||0)/1000),cubbyDepth=Math.max(.05,d-inset);
    const columnBreaks=cubbyBreaks(item,"column"),rowBreaks=cubbyBreaks(item,"row");
    return <group onClick={click}>
      {[0,...columnBreaks,item.width].map((position,i)=><Panel key={`c${i}`} position={[x-w/2+position/1000,y,-inset/2]} size={[i===0||i===cols?frameThickness:columnThickness,h,cubbyDepth]} color={edge}/>)}
      {[0,...rowBreaks,item.h].map((position,i)=><Panel key={`r${i}`} position={[x,y+h/2-position/1000,-inset/2]} size={[w,i===0||i===rows?frameThickness:rowThickness,cubbyDepth]} color={edge}/>)}
    </group>;
  }
  if (item.type === "basket") {
    const rail=.018,front=d/2,back=-d/2;
    return <group onClick={click}>
      <WireBar position={[x,y+h/2,front]} size={[w,rail,rail]} selected={selected} color={itemColor}/>
      <WireBar position={[x,y+h/2,back]} size={[w,rail,rail]} selected={selected} color={itemColor}/>
      <WireBar position={[x-w/2,y,front]} size={[rail,h,rail]} selected={selected} color={itemColor}/>
      <WireBar position={[x+w/2,y,front]} size={[rail,h,rail]} selected={selected} color={itemColor}/>
      <WireBar position={[x-w/2,y,back]} size={[rail,h,rail]} selected={selected} color={itemColor}/>
      <WireBar position={[x+w/2,y,back]} size={[rail,h,rail]} selected={selected} color={itemColor}/>
      {[.22,.44,.66,.88].map(v=><WireBar key={`front-${v}`} position={[x,y-h/2+h*v,front]} size={[w,rail*.62,rail*.62]} selected={selected} color={itemColor}/>)}
      {[.25,.5,.75].map(v=><group key={`side-${v}`}>
        <WireBar position={[x-w/2,y-h/2+h*v,0]} size={[rail*.62,rail*.62,d]} selected={selected} color={itemColor}/>
        <WireBar position={[x+w/2,y-h/2+h*v,0]} size={[rail*.62,rail*.62,d]} selected={selected} color={itemColor}/>
      </group>)}
      {Array.from({length:8}).map((_,i)=><WireBar key={`base-${i}`} position={[x-w/2+w*(i+.5)/8,y-h/2+.012,0]} size={[rail*.55,rail*.55,d]} selected={selected} color={itemColor}/>)}
      <WireBar position={[x,y-h/2,front]} size={[w,rail*1.2,rail*1.2]} selected={selected} color={itemColor}/>
      <WireBar position={[x,y-h/2,back]} size={[w,rail*1.2,rail*1.2]} selected={selected} color={itemColor}/>
      <mesh position={[x,y+h/2+.018,front+.018]} castShadow><boxGeometry args={[w*.28,.035,.018]}/><meshStandardMaterial color="#58636c" metalness={.82} roughness={.2}/></mesh>
    </group>;
  }
  if (item.type === "shoe") return <group onClick={click}>{Array.from({length:item.rows||3}).map((_,i)=><mesh key={i} position={[x,y-h/2+h*(i+.5)/(item.rows||3),.04]} rotation={[Math.PI/14,0,0]} castShadow><boxGeometry args={[w,.025,d]}/><meshStandardMaterial color={edge} roughness={.6}/></mesh>)}</group>;
  if (item.type === "mirror") {
    const variant=item.variant||"rectangle";
    const r=Math.min(w,h)/2;
    const glass=<meshPhysicalMaterial color={selected?"#a7d2ec":item.color||"#a6bbc7"} metalness={.68} roughness={.045} clearcoat={1} clearcoatRoughness={.04}/>;
    if(variant==="circle") return <group position={[x,y,d/2-.015]} onClick={click}>
      <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[r,r,.018,64]}/>{glass}</mesh>
      <mesh><torusGeometry args={[r,.018,10,64]}/><meshStandardMaterial color={selected?"#5da6f7":"#7a838a"} metalness={.88} roughness={.16}/></mesh>
      <mesh position={[-r*.25,r*.22,.014]} rotation={[0,0,-.6]}><planeGeometry args={[r*.5,.025]}/><meshBasicMaterial color="#e8f7ff" transparent opacity={.45}/></mesh>
    </group>;
    if(variant==="quarter") return <group position={[x-r/2,y-r/2,d/2-.015]} onClick={click}>
      <mesh castShadow><circleGeometry args={[r,64,0,Math.PI/2]}/>{glass}</mesh>
      <mesh><torusGeometry args={[r,.018,10,48,Math.PI/2]}/><meshStandardMaterial color={selected?"#5da6f7":"#7a838a"} metalness={.88} roughness={.16}/></mesh>
      <WireBar position={[r/2,0,.008]} size={[r,.025,.025]} selected={selected}/><WireBar position={[0,r/2,.008]} size={[.025,r,.025]} selected={selected}/>
    </group>;
    const mw=variant==="square"?Math.min(w,h):w,mh=variant==="square"?Math.min(w,h):h;
    return <group position={[x,y,d/2-.015]} onClick={click}>
      <mesh castShadow><boxGeometry args={[mw-.035,mh-.035,.018]}/>{glass}</mesh>
      <WireBar position={[0,mh/2,0]} size={[mw+.02,.025,.03]} selected={selected}/><WireBar position={[0,-mh/2,0]} size={[mw+.02,.025,.03]} selected={selected}/>
      <WireBar position={[-mw/2,0,0]} size={[.025,mh,.03]} selected={selected}/><WireBar position={[mw/2,0,0]} size={[.025,mh,.03]} selected={selected}/>
      <mesh position={[-mw*.18,mh*.22,.018]} rotation={[0,0,-.55]}><planeGeometry args={[mw*.45,.022]}/><meshBasicMaterial color="#e9f8ff" transparent opacity={.42}/></mesh>
    </group>;
  }
  if (item.type === "led") return <mesh position={[x,y,d/2-.005]} onClick={click}><boxGeometry args={[.018,h,.018]}/><meshStandardMaterial color={item.color||"#fff3ba"} emissive={item.color||"#ffd66e"} emissiveIntensity={selected?4:2}/></mesh>;
  if (item.type === "divider") return <group onClick={click}><Panel position={[x,y,0]} size={[w,h,d]} color={edge}/>{selected&&<mesh position={[x,y,d/2+.004]}><boxGeometry args={[w+.018,h+.018,.008]}/><meshBasicMaterial color="#4b9cff" wireframe/></mesh>}</group>;
  if(item.type==="shelf") return <group onClick={click}>
    <Panel position={[x,y,0]} size={[w,h,d]} color={itemColor}/>
    <Panel position={[x,y-h/2-.009,d/2-.018]} size={[w+.018,h+.018,.04]} color={itemColor}/>
    <Panel position={[x,y+h/2+.006,0]} size={[w-.018,.012,d-.02]} color={itemColor}/>
    {selected&&<mesh position={[x,y,0]}>
      <boxGeometry args={[w+.025,h+.035,d+.025]}/>
      <meshBasicMaterial color="#4b9cff" wireframe transparent opacity={.95}/>
    </mesh>}
    {[-1,1].map(side=><group key={side}>
      <mesh position={[x+side*(w/2-.035),y-h/2-.026,d*.32]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.011,.011,.028,16]}/><meshStandardMaterial color="#c0c6ca" metalness={.8} roughness={.2}/></mesh>
      <mesh position={[x+side*(w/2-.035),y-h/2-.026,-d*.32]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.011,.011,.028,16]}/><meshStandardMaterial color="#c0c6ca" metalness={.8} roughness={.2}/></mesh>
    </group>)}
  </group>;
  return <Panel position={[x,y,0]} size={[w,h,d]} color={edge} onClick={click}/>;
}

function CabinetRun3D({ run, sections, height, depth, color, position, rotation = [0,0,0], selection, onSelectSection, onSelectItem, theme }) {
  const total = sections.reduce((sum,s)=>sum+s.width,0);
  const W=total/1000,H=height/1000,D=depth/1000,T=.036;
  let cursor=-total/2;
  const sectionData=sections.map(section=>{const center=cursor+section.width/2;cursor+=section.width;return {section,center}});
  return <group position={position} rotation={rotation}>
    <Panel position={[0,H/2,-D/2]} size={[W,H,.025]} color={theme==="light"?"#d8dde1":"#596570"}/>
    <Panel position={[0,H-T/2,0]} size={[W+T,T,D]} color={color}/>
    <Panel position={[0,T/2,0]} size={[W+T,T,D]} color={color}/>
    <Panel position={[-W/2,T+H/2-T,0]} size={[T,H-T*2,D]} color={color}/>
    <Panel position={[W/2,T+H/2-T,0]} size={[T,H-T*2,D]} color={color}/>
    {sectionData.map(({section,center},index)=><group key={section.id}>
      <mesh position={[center/1000,H/2,.012]} onClick={e=>{e.stopPropagation();onSelectSection(run,section.id)}}>
        <boxGeometry args={[section.width/1000-.04,H-.07,.015]}/>
        <meshStandardMaterial color={selection?.sectionId===section.id&&selection.run===run?"#294a70":"#20272e"} transparent opacity={selection?.sectionId===section.id&&selection.run===run ? .72 : .45}/>
      </mesh>
      {index>0&&<Panel position={[(center-section.width/2)/1000,H/2,0]} size={[T,H-T*2,D]} color={color}/>}
      {section.items.map(item=><Fitting3D key={item.id} item={item} sectionWidth={section.width} height={height} depth={depth} xCenter={center/1000} selected={selection?.itemId===item.id} onSelect={()=>onSelectItem(run,section.id,item.id)}/>)}
    </group>)}
  </group>;
}

function CornerBox3D({ side, centerWidth, centerDepth, sideHeight, sideDepth, color }) {
  const gap=.075;
  const direction=side==="left"?-1:1;
  const boxWidth=gap+.28;
  const boxDepth=sideDepth;
  const boxHeight=sideHeight;
  const x=direction*(centerWidth/2+gap+.08);
  const z=.02;
  return <Panel position={[x,boxHeight/2,z]} size={[boxWidth,boxHeight,boxDepth]} color={color}/>;
}

function RunResizeHandles({ width, height, depth, position, rotation = [0,0,0], onStart }) {
  const W=width/1000,H=height/1000,D=depth/1000;
  const handle=(edge,cursor)=>({
    onPointerDown:e=>{e.stopPropagation();e.target.setPointerCapture?.(e.pointerId);onStart(edge,e)},
    onPointerOver:e=>{e.stopPropagation();document.body.style.cursor=cursor},
    onPointerOut:()=>{document.body.style.cursor=""},
  });
  const material=<meshBasicMaterial color="#53a2ff" transparent opacity={.9}/>;
  return <group position={position} rotation={rotation}>
    <mesh position={[-W/2,H/2,D/2+.04]} {...handle("left","ew-resize")}><boxGeometry args={[.045,H,.045]}/>{material}</mesh>
    <mesh position={[W/2,H/2,D/2+.04]} {...handle("right","ew-resize")}><boxGeometry args={[.045,H,.045]}/>{material}</mesh>
    <mesh position={[0,H,D/2+.04]} {...handle("top","ns-resize")}><boxGeometry args={[W,.045,.045]}/>{material}</mesh>
    <mesh position={[-W/2,H,D/2+.07]} {...handle("top-left","nwse-resize")}><boxGeometry args={[.12,.12,.075]}/>{material}</mesh>
    <mesh position={[W/2,H,D/2+.07]} {...handle("top-right","nesw-resize")}><boxGeometry args={[.12,.12,.075]}/>{material}</mesh>
  </group>;
}

function WardrobeScene({ shape, runs, dimensions, runColors, selection, setSelection, view, visibility, cameraPreset, onStartEnvelopeResize, theme }) {
  const centerWidth=runs.center.reduce((a,s)=>a+s.width,0)/1000;
  const leftWidth=runs.left.reduce((a,s)=>a+s.width,0)/1000;
  const rightWidth=runs.right.reduce((a,s)=>a+s.width,0)/1000;
  const center=dimensions.center,left=dimensions.left,right=dimensions.right;
  const sideGap=.075;
  const selectSection=(run,sectionId)=>setSelection({type:"section",run,sectionId});
  const selectItem=(run,sectionId,itemId)=>setSelection({type:"item",run,sectionId,itemId});
  const sceneBackground=theme==="light"?"#e5e8eb":"#171b20";
  return <Canvas onPointerMissed={()=>setSelection(null)} shadows dpr={[1,1.7]} gl={{antialias:true}} camera={{position:[.8,3.25,7.4],fov:38,near:.1,far:100}}>
    <color attach="background" args={[sceneBackground]}/>
    <fog attach="fog" args={[sceneBackground,10,22]}/>
    <ambientLight intensity={1.2}/>
    <directionalLight position={[4,8,5]} intensity={3.2} castShadow shadow-mapSize={[2048,2048]}/>
    <directionalLight position={[-5,3,2]} intensity={1.1} color="#8ab5ff"/>
    <group position={[0,0,0]}>
      {visibility.center&&<CabinetRun3D run="center" sections={runs.center} height={center.height} depth={center.depth} color={runColors.center} position={[0,0,0]} selection={selection} onSelectSection={selectSection} onSelectItem={selectItem} theme={theme}/>} 
      {view==="front"&&visibility.center&&<RunResizeHandles width={centerWidth*1000} height={center.height} depth={center.depth} position={[0,0,0]} onStart={onStartEnvelopeResize}/>}
      {visibility.left&&(shape==="left"||shape==="u")&&<>
        <CornerBox3D side="left" centerWidth={centerWidth} centerDepth={center.depth/1000} sideHeight={left.height/1000} sideDepth={left.depth/1000} color={runColors.left}/>
        <CabinetRun3D run="left" sections={runs.left} height={left.height} depth={left.depth} color={runColors.left} position={[-centerWidth/2-left.depth/2000-sideGap,0,leftWidth/2+center.depth/2000+.015]} rotation={[0,Math.PI/2,0]} selection={selection} onSelectSection={selectSection} onSelectItem={selectItem} theme={theme}/>
      </>}
      {visibility.right&&(shape==="right"||shape==="u")&&<>
        <CornerBox3D side="right" centerWidth={centerWidth} centerDepth={center.depth/1000} sideHeight={right.height/1000} sideDepth={right.depth/1000} color={runColors.right}/>
        <CabinetRun3D run="right" sections={runs.right} height={right.height} depth={right.depth} color={runColors.right} position={[centerWidth/2+right.depth/2000+sideGap,0,rightWidth/2+center.depth/2000+.015]} rotation={[0,-Math.PI/2,0]} selection={selection} onSelectSection={selectSection} onSelectItem={selectItem} theme={theme}/>
      </>}
    </group>
    <Grid position={[0,-.02,1]} args={[18,18]} cellSize={.25} cellThickness={.45} cellColor="#34404a" sectionSize={1} sectionThickness={1} sectionColor="#53616d" fadeDistance={14} fadeStrength={1}/>
    <ContactShadows position={[0,0,1]} opacity={.5} scale={12} blur={2.4} far={6}/>
    <OrbitControls makeDefault target={[0,1.15,.55]} minDistance={2.2} maxDistance={20} minPolarAngle={.04} maxPolarAngle={Math.PI-.04} enableRotate={view==="3d"} enablePan enableZoom zoomToCursor screenSpacePanning enableDamping dampingFactor={.075} rotateSpeed={.72} panSpeed={.85} zoomSpeed={.8}/>
    <CameraKeyboardControls enabled={view==="3d"}/>
    <CameraRig view={view} shape={shape} preset={cameraPreset}/>
    <GizmoHelper alignment="bottom-right" margin={[75,65]}><GizmoViewport axisColors={["#ef6d6d","#62c77a","#5799ff"]} labelColor="#fff"/></GizmoHelper>
  </Canvas>;
}

export default function App() {
  const [shape, setShape] = useState("u");
  const [runs, setRuns] = useState({ center: seedSections, left: cloneSections("l"), right: cloneSections("r") });
  const [selection, setSelection] = useState({ type: "section", run: "center", sectionId: "s2" });
  const [view, setView] = useState("3d");
  const [zoom, setZoom] = useState(78);
  const [height, setHeight] = useState(2400);
  const [depth, setDepth] = useState(600);
  const [sideDimensions, setSideDimensions] = useState({
    left: {height: 2300, depth: 560},
    right: {height: 2300, depth: 560},
  });
  const [runColors, setRunColors] = useState({center:"#69737d",left:"#738877",right:"#536b84"});
  const [snap, setSnap] = useState(true);
  const [visibility, setVisibility] = useState({center:true,left:true,right:true});
  const [cameraPreset, setCameraPreset] = useState({name:"home",revision:0});
  const [toast, setToast] = useState("");
  const [historyRevision, setHistoryRevision] = useState(0);
  const [theme, setTheme] = useState("dark");
  const drag = useRef(null);
  const importInput = useRef(null);
  const hydrated = useRef(false);
  const history = useRef({past:[],future:[]});
  const id = useRef(40);

  const visibleRuns = useMemo(() => shape === "straight" ? ["center"] : shape === "left" ? ["left","center"] : shape === "right" ? ["center","right"] : ["left","center","right"], [shape]);
  const currentSection = selection?.sectionId ? runs[selection.run]?.find(s => s.id === selection.sectionId) : null;
  const currentItem = selection?.itemId ? currentSection?.items.find(i => i.id === selection.itemId) : null;
  const activeHeight = selection?.run === "center" ? height : sideDimensions[selection?.run]?.height || height;
  const activeDepth = selection?.run === "center" ? depth : sideDimensions[selection?.run]?.depth || depth;
  const centerWidth = runs.center.reduce((sum,s)=>sum+s.width,0);
  const runDimensions = {center:{height,depth},left:sideDimensions.left,right:sideDimensions.right};
  const pxScale = Math.min(0.235, 570 / Math.max(centerWidth, 1));

  const designSnapshot = () => ({
    shape,
    runs: structuredClone(runs),
    selection: selection ? {...selection} : null,
    height,
    depth,
    sideDimensions: structuredClone(sideDimensions),
    runColors: {...runColors},
    theme,
  });
  const restoreSnapshot = snapshot => {
    setShape(snapshot.shape||"straight");
    setRuns(snapshot.runs);
    setSelection(snapshot.selection||null);
    setHeight(snapshot.height||2400);
    setDepth(snapshot.depth||600);
    setSideDimensions(snapshot.sideDimensions||{left:{height:2300,depth:560},right:{height:2300,depth:560}});
    setRunColors(snapshot.runColors||{center:"#69737d",left:"#738877",right:"#536b84"});
    setTheme(snapshot.theme||"dark");
  };
  const captureHistory = () => {
    history.current.past.push(designSnapshot());
    if(history.current.past.length>80) history.current.past.shift();
    history.current.future=[];
    setHistoryRevision(value=>value+1);
  };
  const undo = () => {
    const previous=history.current.past.pop();
    if(!previous)return;
    history.current.future.push(designSnapshot());
    restoreSnapshot(previous);
    setHistoryRevision(value=>value+1);
  };
  const redo = () => {
    const next=history.current.future.pop();
    if(!next)return;
    history.current.past.push(designSnapshot());
    restoreSnapshot(next);
    setHistoryRevision(value=>value+1);
  };
  const commitRuns = (run, next) => setRuns(prev => ({...prev, [run]: next}));
  const patchSection = (patch) => {
    captureHistory();
    commitRuns(selection.run, runs[selection.run].map(s => s.id === selection.sectionId ? {...s,...patch} : s));
  };
  const patchItem = (patch) => {
    captureHistory();
    commitRuns(selection.run, runs[selection.run].map(s => s.id === selection.sectionId ? {...s,items:s.items.map(i=>{
      if(i.id!==selection.itemId)return i;
      const next={...i,...patch};
      if(i.type==="cubby"){
        if(patch.h!==undefined&&patch.rowBreaks===undefined&&Array.isArray(i.rowBreaks))next.rowBreaks=i.rowBreaks.map(value=>value*patch.h/i.h);
        if(patch.width!==undefined&&patch.columnBreaks===undefined&&Array.isArray(i.columnBreaks))next.columnBreaks=i.columnBreaks.map(value=>value*patch.width/i.width);
      }
      return next;
    })} : s));
  };
  const setRunDimension = (run, key, value) => {
    captureHistory();
    if (run === "center") {
      if (key === "height") setHeight(value);
      if (key === "depth") setDepth(value);
    } else setSideDimensions(previous => ({...previous,[run]:{...previous[run],[key]:value}}));
  };
  const setRunLength = (run, value) => {
    captureHistory();
    const sections=runs[run], current=sections.reduce((sum,section)=>sum+section.width,0);
    const ratio=Math.max(500,value)/current;
    commitRuns(run,sections.map(section=>({...section,width:Math.max(320,Math.round(section.width*ratio))})));
  };
  const flash = message => { setToast(message); setTimeout(()=>setToast(""),1800); };
  const setCamera = name => setCameraPreset(previous=>({name,revision:previous.revision+1}));
  const changeShape = nextShape => {
    if(nextShape===shape)return;
    captureHistory();
    setShape(nextShape);
  };
  const setRunColor = (run,color) => {
    if(runColors[run]===color)return;
    captureHistory();
    setRunColors(previous=>({...previous,[run]:color}));
  };

  function addSection() {
    captureHistory();
    const run = selection?.run || "center";
    const nextId = `s${++id.current}`;
    const selectedIndex = runs[run].findIndex(s => s.id === selection?.sectionId);
    const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : runs[run].length;
    const next = [...runs[run]];
    next.splice(insertAt, 0, {id:nextId,width:600,items:[]});
    commitRuns(run, next);
    setSelection({type:"section",run,sectionId:nextId});
  }

  function moveSection(run, sectionId, direction) {
    const next = [...runs[run]];
    const from = next.findIndex(section => section.id === sectionId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= next.length) return;
    captureHistory();
    [next[from], next[to]] = [next[to], next[from]];
    commitRuns(run, next);
  }

  function moveItemToSection(targetSectionId) {
    if (!currentItem || targetSectionId === currentSection.id) return;
    captureHistory();
    const runSections = runs[selection.run];
    const target = runSections.find(section => section.id === targetSectionId);
    const moved = {...currentItem, x:20, width:Math.min(currentItem.width,target.width-40)};
    commitRuns(selection.run, runSections.map(section => {
      if (section.id === currentSection.id) return {...section,items:section.items.filter(item=>item.id!==currentItem.id)};
      if (section.id === targetSectionId) return {...section,items:[...section.items,moved]};
      return section;
    }));
    setSelection({type:"item",run:selection.run,sectionId:targetSectionId,itemId:moved.id});
  }

  function nudgeItem(dx, dy) {
    if (!currentItem) return;
    patchItem({
      x: Math.max(18,Math.min(currentSection.width-currentItem.width-18,(currentItem.x??20)+dx)),
      y: Math.max(18,Math.min(activeHeight-currentItem.h-18,currentItem.y+dy)),
    });
  }

  function alignItem(alignment) {
    if (!currentItem || !currentSection) return;
    const horizontalLimit=Math.max(18,currentSection.width-currentItem.width-18);
    const verticalLimit=Math.max(18,activeHeight-currentItem.h-18);
    if(alignment==="left") patchItem({x:18});
    if(alignment==="center") patchItem({x:Math.max(18,(currentSection.width-currentItem.width)/2)});
    if(alignment==="right") patchItem({x:horizontalLimit});
    if(alignment==="middle") patchItem({y:Math.min(verticalLimit,Math.max(18,(activeHeight-currentItem.h)/2))});
  }

  function addItem(type) {
    if (!currentSection) return flash("Select a section first");
    const defaults = {
      shelf:{h:18,width:currentSection.width-40}, rail:{h:40,width:currentSection.width-60},
      drawer:{h:480,width:currentSection.width-40,drawers:3}, basket:{h:300,width:currentSection.width-50},
      cubby:{h:480,width:currentSection.width-40,rows:2,columns:2,rowGap:20,columnGap:20,frameThickness:25,depthInset:0}, shoe:{h:450,width:currentSection.width-40,rows:3},
      mirror:{h:1200,width:Math.min(500,currentSection.width-60),variant:"rectangle"}, led:{h:1200,width:20},
      divider:{h:1200,width:18,depth:activeDepth-40},
    };
    const item = {id:`i${++id.current}`,type,x:20,y:Math.min(1200,100+runs[selection.run].flatMap(s=>s.items).length*90),...defaults[type]};
    patchSection({items:[...currentSection.items,item]});
    setSelection({...selection,type:"item",itemId:item.id});
  }

  function removeSelection() {
    if (selection.type === "item") {
      patchSection({items:currentSection.items.filter(i=>i.id!==selection.itemId)});
      setSelection({type:"section",run:selection.run,sectionId:selection.sectionId});
    } else if (selection.type === "section" && runs[selection.run].length > 1) {
      captureHistory();
      commitRuns(selection.run,runs[selection.run].filter(s=>s.id!==selection.sectionId));
      setSelection({type:"section",run:selection.run,sectionId:runs[selection.run].find(s=>s.id!==selection.sectionId).id});
    }
  }

  function duplicate() {
    if (!currentItem) return;
    const copy = {...currentItem,id:`i${++id.current}`,y:Math.min(height-currentItem.h-40,currentItem.y+80)};
    patchSection({items:[...currentSection.items,copy]});
    setSelection({...selection,itemId:copy.id});
  }

  useEffect(() => {
    const shortcuts = e => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if(e.shiftKey)redo();else undo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeSelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicate();
      }
      if (selection?.type === "item" && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const amount = e.shiftKey ? SNAP * 4 : SNAP;
        nudgeItem(e.key==="ArrowLeft"?-amount:e.key==="ArrowRight"?amount:0,e.key==="ArrowUp"?-amount:e.key==="ArrowDown"?amount:0);
      }
      if (e.key === "Escape") setSelection(null);
    };
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  });

  function startItemDrag(e,run,section,item) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    captureHistory();
    drag.current={kind:"item",startX:e.clientX,startY:e.clientY,startItemX:item.x??20,startItemY:item.y,itemId:item.id,itemWidth:item.width,itemHeight:item.h,sectionWidth:section.width,sectionId:section.id,run};
  }

  function startDividerDrag(e, run, index, projection = 1) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    captureHistory();
    drag.current={kind:"divider",startX:e.clientX,run,index,left:runs[run][index].width,right:runs[run][index+1].width,projection};
  }

  function startEnvelopeResize(edge, pointerEvent) {
    captureHistory();
    const run="center";
    const viewportHeight=document.querySelector(".cad-viewport")?.clientHeight || 700;
    const cameraDistance=8.5;
    const visibleWorldHeight=2*cameraDistance*Math.tan(38*Math.PI/360);
    drag.current={
      kind:"envelope",edge,run,
      startX:pointerEvent.clientX,startY:pointerEvent.clientY,
      widths:runs[run].map(section=>section.width),
      startLength:runs[run].reduce((sum,section)=>sum+section.width,0),
      startHeight:height,
      mmPerPixel:visibleWorldHeight*1000/viewportHeight,
    };
  }

  useEffect(()=>{
    const move=e=>{
      if(!drag.current)return;
      const d=drag.current;
      if(d.kind==="item"){
        const deltaY=(e.clientY-d.startY)/pxScale;
        const deltaX=(e.clientX-d.startX)/(pxScale*(d.run==="center"?1:.68));
        const runHeight=d.run==="center"?height:sideDimensions[d.run].height;
        let y=Math.max(18,Math.min(runHeight-d.itemHeight-18,d.startItemY+deltaY));
        let x=Math.max(18,Math.min(d.sectionWidth-d.itemWidth-18,d.startItemX+deltaX));
        if(snap){y=Math.round(y/SNAP)*SNAP;x=Math.round(x/SNAP)*SNAP}
        setRuns(prev=>({...prev,[d.run]:prev[d.run].map(s=>s.id===d.sectionId?{...s,items:s.items.map(i=>i.id===d.itemId?{...i,x,y}:i)}:s)}));
      } else if(d.kind==="divider") {
        let delta=(e.clientX-d.startX)/(pxScale*d.projection);
        if(snap)delta=Math.round(delta/50)*50;
        delta=Math.max(320-d.left,Math.min(d.right-320,delta));
        setRuns(prev=>({...prev,[d.run]:prev[d.run].map((s,i)=>i===d.index?{...s,width:d.left+delta}:i===d.index+1?{...s,width:d.right-delta}:s)}));
      } else {
        const horizontal=d.edge.includes("left")?-1:d.edge.includes("right")?1:0;
        const vertical=d.edge.includes("top")?1:0;
        if(horizontal){
          let nextLength=d.startLength+(e.clientX-d.startX)*d.mmPerPixel*horizontal;
          if(snap)nextLength=Math.round(nextLength/50)*50;
          nextLength=Math.max(d.widths.length*320,nextLength);
          const ratio=nextLength/d.startLength;
          setRuns(prev=>({...prev,[d.run]:prev[d.run].map((section,index)=>({...section,width:Math.max(320,Math.round(d.widths[index]*ratio))}))}));
        }
        if(vertical){
          let nextHeight=d.startHeight-(e.clientY-d.startY)*d.mmPerPixel;
          if(snap)nextHeight=Math.round(nextHeight/50)*50;
          setHeight(Math.max(1200,nextHeight));
        }
      }
    };
    const up=()=>{drag.current=null;document.body.style.cursor=""};
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);
    return()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};
  },[height,sideDimensions,pxScale,snap]);

  useEffect(()=>{
    try {
      const saved=localStorage.getItem("wardrobe-designer-autosave");
      if(saved)restoreSnapshot(JSON.parse(saved).design||JSON.parse(saved));
    } catch { /* Ignore an invalid recovery snapshot. */ }
    hydrated.current=true;
  },[]);

  useEffect(()=>{
    if(!hydrated.current)return;
    try { localStorage.setItem("wardrobe-designer-autosave",JSON.stringify({version:1,savedAt:new Date().toISOString(),design:designSnapshot()})); }
    catch { /* Project files remain available if browser storage is unavailable. */ }
  },[shape,runs,height,depth,sideDimensions,runColors,theme]);

  function exportProject(){
    const payload={format:"atelier-wardrobe",version:1,savedAt:new Date().toISOString(),design:designSnapshot()};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
    const link=document.createElement("a");link.href=url;link.download=`wardrobe-${new Date().toISOString().slice(0,10)}.wardrobe.json`;link.click();URL.revokeObjectURL(url);
    flash("Project file saved");
  }
  async function importProject(event){
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    try {
      const payload=JSON.parse(await file.text()),snapshot=payload.design||payload;
      if(!snapshot.runs?.center||!Array.isArray(snapshot.runs.center))throw new Error("Invalid project");
      captureHistory();restoreSnapshot(snapshot);flash(`Opened ${file.name}`);
    } catch { flash("That is not a valid wardrobe project file"); }
  }
  function exportPdf(){window.print()}

  return <main className="cad-app" data-theme={theme}>
    <header className="cad-top">
      <div className="file-title"><b>Wardrobe 01 <i>•</i> Saved</b></div>
      <div className="history">
        <button onClick={undo} disabled={!history.current.past.length} title="Undo (Command + Z)"><I name="undo" size={17}/></button>
        <button onClick={redo} disabled={!history.current.future.length} title="Redo (Command + Shift + Z)"><I name="redo" size={17}/></button>
      </div>
      <div className="header-views">{[["3d","cube","3D"],["front","front","Front"],["plan","plan","Plan"]].map(([key,icon,label])=><button key={key} className={view===key?"active":""} onClick={()=>{setView(key);setCamera("home")}}><I name={icon} size={16}/>{label}</button>)}</div>
      <div className="run-visibility"><span>Visibility</span>{["left","center","right"].map(run=><button key={run} className={visibility[run]?"visible":""} disabled={(run==="left"&&shape!=="left"&&shape!=="u")||(run==="right"&&shape!=="right"&&shape!=="u")} onClick={()=>setVisibility(previous=>({...previous,[run]:!previous[run]}))}><I name="eye" size={14}/>{run[0].toUpperCase()}</button>)}</div>
      <div className="top-actions">
        <button onClick={()=>setTheme(value=>value==="dark"?"light":"dark")} title="Toggle light and dark theme">{theme==="dark"?"☀":"☾"} {theme==="dark"?"Light":"Dark"}</button>
        <button onClick={()=>importInput.current?.click()}>Open project</button>
        <button onClick={exportProject}>Save project</button>
        <button className="primary" onClick={exportPdf}><I name="export"/> Drawing</button>
        <input ref={importInput} className="file-input" type="file" accept=".json,.wardrobe" onChange={importProject}/>
      </div>
    </header>

    <aside className="build-panel">
      <div className="panel-title"><small>ASSEMBLY</small><b>Build structure</b></div>
      <section className="layout-section">
        <label>WARDROBE FOOTPRINT</label>
        <div className="shape-options">
          {[["straight","I"],["left","L"],["right","⅃"],["u","U"]].map(([key,g])=><button key={key} className={shape===key?"active":""} onClick={()=>changeShape(key)}><b>{g}</b><span>{key==="straight"?"Straight":key==="u"?"U shape":key==="left"?"L left":"L right"}</span></button>)}
        </div>
      </section>
      <section>
        <div className="section-heading"><label>RUNS & SECTIONS</label><button onClick={addSection}><I name="plus" size={14}/> Add</button></div>
        {visibleRuns.map(run=><div className="run-tree" key={run}>
          <div className="run-name"><span>⌄</span><b>{run} run</b><small>{runs[run].reduce((a,s)=>a+s.width,0)} mm</small></div>
          {runs[run].map((s,n)=><div className={`section-tree-row ${selection?.sectionId===s.id&&selection.run===run?"selected":""}`} key={s.id}>
            <button className="section-select" onClick={()=>setSelection({type:"section",run,sectionId:s.id})}><i>{n+1}</i><span>Section {String(n+1).padStart(2,"0")}</span><small>{Math.round(s.width)} mm</small></button>
            <span className="section-order"><button disabled={n===0} onClick={()=>moveSection(run,s.id,-1)} title="Move section left">‹</button><button disabled={n===runs[run].length-1} onClick={()=>moveSection(run,s.id,1)} title="Move section right">›</button></span>
          </div>)}
        </div>)}
      </section>
      <section className="components">
        <label>INTERNAL FITTINGS</label>
        <p>Click to add inside the selected section.</p>
        <div className="component-list">
          {catalog.map(c=><button key={c.type} onClick={()=>addItem(c.type)} disabled={!currentSection}><span>{c.glyph}</span><div><b>{c.name}</b><small>{c.meta}</small></div><i>＋</i></button>)}
        </div>
      </section>
    </aside>

    <section className="viewport-shell">
      <div className={`cad-viewport view-${view}`}>
        <div className="viewport-label"><b>WARDROBE 01</b><span>{view.toUpperCase()} / ORTHOGRAPHIC</span></div>
        <WardrobeScene shape={shape} runs={runs} dimensions={runDimensions} runColors={runColors} selection={selection} setSelection={setSelection} view={view} visibility={visibility} cameraPreset={cameraPreset} onStartEnvelopeResize={startEnvelopeResize} theme={theme}/>
        <div className="camera-tools">
          <button onClick={()=>setCamera("home")} title="Fit wardrobe in view"><I name="fit" size={15}/> Fit</button>
          <button onClick={()=>{setView("3d");setCamera("left")}} title="Left isometric">↙ Left</button>
          <button onClick={()=>{setView("3d");setCamera("right")}} title="Right isometric">Right ↘</button>
        </div>
        <div className="viewport-help">{view==="front" ? <><b>RESIZE</b> drag the blue center-run edges or corners · <b>PAN</b> right drag · <b>ZOOM</b> wheel</> : <><b>MOVE</b> WASD · <b>UP/DOWN</b> double-tap W/S · <b>LOOK</b> Shift + WASD · <b>ORBIT</b> drag</>}</div>
      </div>
    </section>

    <aside className="inspector">
      <div className="panel-title"><small>PROPERTIES</small><b>{currentItem ? catalog.find(c=>c.type===currentItem.type)?.name : currentSection ? "Section" : "Nothing selected"}</b><span className="badge">{selection?.type || "—"}</span></div>
      {currentItem ? <>
        <section>
          <div className="property-title"><label>TRANSFORM</label><I name="lock" size={13}/></div>
          <div className="field-grid">
            <NumberField label="Horizontal position" value={currentItem.x??20} onChange={v=>patchItem({x:Math.min(currentSection.width-currentItem.width-18,v)})}/>
            <NumberField label="Vertical position" value={currentItem.y} onChange={v=>patchItem({y:Math.min(activeHeight-currentItem.h,v)})}/>
            <NumberField label="Element width" value={currentItem.width} onChange={v=>patchItem({width:Math.min(currentSection.width-20,v)})}/>
            <NumberField label="Element height" value={currentItem.h} onChange={v=>patchItem({h:v})}/>
            <NumberField label="Element depth" value={currentItem.depth || activeDepth-40} onChange={v=>patchItem({depth:v})}/>
          </div>
          <ColorChoices label="Element color" value={currentItem.color||"#69737d"} onChange={color=>patchItem({color})}/>
          <div className="nudge-pad">
            <span/>
            <button onClick={()=>nudgeItem(0,-SNAP)} title="Move up">↑</button>
            <span/>
            <button onClick={()=>nudgeItem(-SNAP,0)} title="Move left">←</button>
            <b>{SNAP} mm</b>
            <button onClick={()=>nudgeItem(SNAP,0)} title="Move right">→</button>
            <span/>
            <button onClick={()=>nudgeItem(0,SNAP)} title="Move down">↓</button>
            <span/>
          </div>
          <label className="move-target"><span>Move to section</span><select value={currentSection.id} onChange={e=>moveItemToSection(e.target.value)}>{runs[selection.run].map((section,index)=><option key={section.id} value={section.id}>Section {String(index+1).padStart(2,"0")} · {section.width} mm</option>)}</select></label>
        </section>
        {(currentItem.type==="drawer"||currentItem.type==="cubby"||currentItem.type==="shoe")&&<section>
          <label>CONFIGURATION</label>
          <div className="field-grid">
            {currentItem.type==="drawer"&&<NumberField label="Drawer count" value={currentItem.drawers||3} unit="" step={1} min={1} onChange={v=>patchItem({drawers:Math.min(8,v)})}/>}
            {(currentItem.type==="cubby"||currentItem.type==="shoe")&&<NumberField label="Rows" value={currentItem.rows||2} unit="" step={1} min={1} onChange={v=>patchItem({rows:Math.min(8,v),...(currentItem.type==="cubby"?{rowBreaks:null}:{})})}/>} 
            {currentItem.type==="cubby"&&<NumberField label="Columns" value={currentItem.columns||2} unit="" step={1} min={1} onChange={v=>patchItem({columns:Math.min(6,v),columnBreaks:null})}/>} 
            {currentItem.type==="cubby"&&<NumberField label="Row separator" value={currentItem.rowGap??20} min={0} max={200} onChange={v=>patchItem({rowGap:v})}/>} 
            {currentItem.type==="cubby"&&<NumberField label="Column separator" value={currentItem.columnGap??20} min={0} max={200} onChange={v=>patchItem({columnGap:v})}/>} 
            {currentItem.type==="cubby"&&<NumberField label="Outer frame" value={currentItem.frameThickness??25} min={5} max={200} onChange={v=>patchItem({frameThickness:v})}/>} 
            {currentItem.type==="cubby"&&<NumberField label="Depth inset" value={currentItem.depthInset??0} min={0} max={Math.max(0,(currentItem.depth||activeDepth-40)-50)} onChange={v=>patchItem({depthInset:v})}/>} 
          </div>
          {currentItem.type==="cubby"&&<div className="cubby-layout-fields">
            <p>Set each divider’s exact position from the top or left edge.</p>
            <div className="field-grid">
              {cubbyBreaks(currentItem,"row").map((value,index)=><NumberField key={`row-${index}`} label={`Row divider ${index+1} from top`} value={value} min={20} max={currentItem.h-20} onChange={next=>{const values=cubbyBreaks(currentItem,"row");values[index]=next;patchItem({rowBreaks:values.sort((a,b)=>a-b)})}}/>)}
              {cubbyBreaks(currentItem,"column").map((value,index)=><NumberField key={`column-${index}`} label={`Column divider ${index+1} from left`} value={value} min={20} max={currentItem.width-20} onChange={next=>{const values=cubbyBreaks(currentItem,"column");values[index]=next;patchItem({columnBreaks:values.sort((a,b)=>a-b)})}}/>)}
            </div>
          </div>}
        </section>}
        {currentItem.type==="mirror"&&<section>
          <label>MIRROR SHAPE</label>
          <div className="mirror-shapes">
            {[["square","□","Square"],["rectangle","▯","Rectangle"],["circle","○","Circle"],["quarter","◔","¼ circle"]].map(([value,glyph,label])=><button key={value} className={(currentItem.variant||"rectangle")===value?"active":""} onClick={()=>patchItem({variant:value})}><b>{glyph}</b><span>{label}</span></button>)}
          </div>
        </section>}
        <section><label>ALIGN IN SECTION</label><div className="align-buttons">
          <button className={Math.abs((currentItem.x??20)-18)<1?"active":""} onClick={()=>alignItem("left")} title="Align left">⇤</button>
          <button className={Math.abs((currentItem.x??20)-(currentSection.width-currentItem.width)/2)<1?"active":""} onClick={()=>alignItem("center")} title="Center horizontally">↔</button>
          <button className={Math.abs((currentItem.x??20)-Math.max(18,currentSection.width-currentItem.width-18))<1?"active":""} onClick={()=>alignItem("right")} title="Align right">⇥</button>
          <button className={Math.abs(currentItem.y-Math.min(Math.max(18,activeHeight-currentItem.h-18),Math.max(18,(activeHeight-currentItem.h)/2)))<1?"active":""} onClick={()=>alignItem("middle")} title="Center vertically">↕</button>
        </div></section>
        <div className="object-actions"><button onClick={duplicate}><I name="copy" size={15}/> Duplicate</button><button className="danger" onClick={removeSelection}><I name="trash" size={15}/> Delete</button></div>
      </> : currentSection ? <>
        <section>
          <label>SECTION DIMENSIONS</label>
          <div className="field-grid"><NumberField label="Width" value={currentSection.width} min={320} onChange={v=>patchSection({width:v})}/><NumberField label="Clear height" value={activeHeight-36} onChange={v=>setRunDimension(selection.run,"height",v+36)}/><NumberField label="Cabinet depth" value={activeDepth} min={300} onChange={v=>setRunDimension(selection.run,"depth",v)}/></div>
        </section>
        <section><label>SECTION STRUCTURE</label><div className="summary-row"><span>Fittings</span><b>{currentSection.items.length}</b></div><div className="summary-row"><span>Panel thickness</span><b>18 mm</b></div><div className="summary-row"><span>Back clearance</span><b>20 mm</b></div></section>
        <section><label>SECTION ORDER</label><div className="section-move-actions"><button onClick={()=>moveSection(selection.run,selection.sectionId,-1)} disabled={runs[selection.run][0].id===selection.sectionId}>← Move left</button><button onClick={()=>moveSection(selection.run,selection.sectionId,1)} disabled={runs[selection.run].at(-1).id===selection.sectionId}>Move right →</button></div></section>
        <button className="split-button" onClick={addSection}><I name="plus" size={15}/> Add section to {selection.run} run</button>
        <button className="delete-section" onClick={removeSelection} disabled={runs[selection.run].length===1}><I name="trash" size={14}/> Remove this section</button>
      </> : null}
      <section className="global-dims"><label>{(selection?.run||"center").toUpperCase()} RUN ENVELOPE</label><div className="field-grid"><NumberField label="Run length" value={runs[selection?.run||"center"].reduce((sum,section)=>sum+section.width,0)} min={500} onChange={v=>setRunLength(selection?.run||"center",v)}/><NumberField label="Run height" value={activeHeight} min={1200} onChange={v=>setRunDimension(selection?.run||"center","height",v)}/><NumberField label="Run depth" value={activeDepth} min={300} onChange={v=>setRunDimension(selection?.run||"center","depth",v)}/></div><ColorChoices label="Wardrobe color" value={runColors[selection?.run||"center"]} onChange={color=>setRunColor(selection?.run||"center",color)}/><p className="run-note">Dimensions and color apply only to this run.</p></section>
    </aside>

    {toast&&<div className="toast">{toast}</div>}
    <div className="print-page">
      <header className="print-header"><div><h1>FORMWORK / WARDROBE 01</h1><p>TECHNICAL CONFIGURATION & FITTING SCHEDULE</p></div><b>{shape.toUpperCase()} FOOTPRINT</b></header>
      <div className="print-summary">{visibleRuns.map(run=><div key={run}><span>{run} run</span><b>{runs[run].reduce((sum,s)=>sum+s.width,0)} × {runDimensions[run].height} × {runDimensions[run].depth} mm</b></div>)}</div>
      <div className={`print-runs runs-${visibleRuns.length}`}>
        {visibleRuns.map(run=>{
          const total=runs[run].reduce((sum,s)=>sum+s.width,0),dims=runDimensions[run];
          return <article key={run} className={`print-run unit-${run}`}><h2>{run} wardrobe <span>{runs[run].length} units</span></h2><div className="print-elevation">
            {runs[run].map((section,sectionIndex)=><section key={section.id} style={{width:`${section.width/total*100}%`}}><em>{run[0].toUpperCase()}-{String(sectionIndex+1).padStart(2,"0")} · {section.width} mm</em>{section.items.map((item,itemIndex)=><PrintFitting key={item.id} item={item} itemIndex={itemIndex} section={section} dimensions={dims}/>)}</section>)}
          </div></article>;
        })}
      </div>
      <h2 className="schedule-title">Fitting schedule <span>Positions measured from section top-left</span></h2>
      <table className="fitting-schedule"><thead><tr><th>ID</th><th>Wardrobe unit</th><th>Element</th><th>X</th><th>Y</th><th>Width</th><th>Height</th><th>Depth</th></tr></thead><tbody>
        {visibleRuns.flatMap(run=>runs[run].flatMap((section,sectionIndex)=>section.items.map((item,itemIndex)=>({run,sectionIndex,itemIndex,item})))).map(({run,sectionIndex,itemIndex,item})=><tr className={`row-${run}`} key={`${run}-${item.id}`}><td>{run[0].toUpperCase()}{String(sectionIndex+1).padStart(2,"0")}-{String(itemIndex+1).padStart(2,"0")}</td><td><b>{run.toUpperCase()} · {run[0].toUpperCase()}-{String(sectionIndex+1).padStart(2,"0")}</b></td><td><span className={`schedule-symbol symbol-${item.type}`}/>{item.type.replace("-"," ")}{item.variant?` / ${item.variant}`:""}</td><td>{Math.round(item.x??20)} mm</td><td>{Math.round(item.y)} mm</td><td>{Math.round(item.width)} mm</td><td>{Math.round(item.h)} mm</td><td>{Math.round(item.depth||runDimensions[run].depth-40)} mm</td></tr>)}
      </tbody></table>
      <footer className="print-footer">Generated {new Date().toLocaleDateString("en-GB")} · All dimensions in millimeters · Verify site dimensions before manufacture</footer>
    </div>
  </main>;
}
