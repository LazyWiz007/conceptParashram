"use client";

import React from "react";

/**
 * A WebGL scene that throws leaves a black rectangle and nothing else — no
 * overlay, no console entry you can trust. This surfaces the failure instead.
 */
export class CanvasBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[3d] scene crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          data-scene-error
          className="grid h-full w-full place-items-center p-6 text-center"
        >
          <pre className="max-w-xl overflow-auto whitespace-pre-wrap text-left text-xs text-red-300">
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack?.split("\n").slice(0, 8).join("\n")}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
