import * as d3 from 'd3';

declare module 'd3' {
  interface D3DragEvent<T extends d3.BaseType, S, D> {
    active: boolean;
    x: number;
    y: number;
  }

  interface D3ZoomEvent<T extends d3.BaseType, D> {
    transform: d3.ZoomTransform;
  }

  interface SimulationNodeDatum {
    size?: number;
    color?: string;
    name?: string;
    type?: string;
    id: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
  }

  interface ZoomTransform {
    x: number;
    y: number;
    k: number;
  }

  interface ForceLink<N extends SimulationNodeDatum, L> {
    id(fn: (d: N) => string): this;
    distance(fn: (d: L) => number): this;
    strength(fn: (d: L) => number): this;
  }

  interface Simulation<N extends SimulationNodeDatum, L, A = undefined, B = undefined> {
    nodes(nodes: N[]): this;
    force(name: string, force: any): this;
    alpha(alpha: number): this;
    restart(): this;
    stop(): void;
    tick(): void;
    on(event: string, callback: () => void): this;
    alphaTarget(target: number): this;
  }
}

declare module 'd3-force' {
  function forceSimulation<N extends d3.SimulationNodeDatum>(nodes?: N[]): d3.Simulation<N, any>;
  function forceLink<N extends d3.SimulationNodeDatum, L>(links?: L[]): d3.ForceLink<N, L>;
  function forceManyBody(): any;
  function forceCenter(x: number, y: number): any;
  function forceCollide(): { radius(fn: (d: d3.SimulationNodeDatum) => number): any };
}

declare module 'd3-selection' {
  function select(selector: string | Element): d3.Selection<Element, unknown, null, undefined>;
}

declare module 'd3-zoom' {
  function zoom<T extends Element>(): d3.ZoomBehavior<T, unknown>;
  const zoomIdentity: d3.ZoomTransform;
  interface ZoomBehavior<T extends Element, D> {
    scaleExtent(extent: [number, number]): this;
    on(type: string, listener: (event: d3.D3ZoomEvent<T, D>) => void): this;
    transform(selection: d3.Selection<T, D, any, any>, transform: d3.ZoomTransform): void;
  }
}

declare module 'd3-drag' {
  function drag<T extends Element, D>(): d3.DragBehavior<T, D, D | d3.SubjectPosition>;
  interface DragBehavior<T extends Element, D, S> {
    on(type: string, listener: (event: d3.D3DragEvent<T, S, D>) => void): this;
  }
}
