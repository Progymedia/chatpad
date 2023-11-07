import React, { memo, useCallback, useEffect } from "react";
import mermaid from "mermaid";
import { MermaidConfig } from "mermaid/dist/config.type";
import { Alert, Code } from "@mantine/core";
import { useTheme } from "@emotion/react";
import { useId } from "@mantine/hooks";

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "dark",
  logLevel: "fatal",
  securityLevel: "strict",
  fontFamily: '"trebuchet MS", verdana, arial, sans-serif',
  arrowMarkerAbsolute: false,
  flowchart: {
    htmlLabels: true,
    curve: "linear",
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    bottomMarginAdj: 1,
    useMaxWidth: true,
    rightAngles: false,
    showSequenceNumbers: false,
  },
  gantt: {
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    leftPadding: 75,
    gridLineStartPadding: 35,
    fontSize: 11,
    numberSectionStyles: 4,
    axisFormat: "%Y-%m-%d",
  },
};

interface MermaidProps {
  chart: string;
  config?: MermaidConfig;
}

const Mermaid = memo(
  function Mermaid({ chart, config }: MermaidProps) {
    const [error, setError] = React.useState<string | undefined>(undefined);

    const theme = useTheme();
    const configTheme = {
      // @ts-ignore
      theme: theme.colorScheme == "dark" ? "dark" : "default",
    };
    // Mermaid initilize its config
    mermaid.initialize({
      ...DEFAULT_CONFIG,
      ...(config || {}),
      ...configTheme,
    });

    const diagramNodeRef = React.useRef<HTMLDivElement>(null);

    const renderMermaid = useCallback(
      async function () {
        if (diagramNodeRef.current == null) return;
        try {
          await mermaid.run({ nodes: [diagramNodeRef.current] });
        } catch (e: any) {
          setError(e.message);
        }
      },
      [chart]
    );
    useEffect(() => {
      renderMermaid();
    }, [chart]);

    if (!chart) return null;
    return (
      <>
        {error && (
          <Alert color="red" title="Invalid">
            <p>Couldn't parse the mermaid chart:</p>
            <pre>{error}</pre>
          </Alert>
        )}
        <Code block className="mermaid">
          <div ref={diagramNodeRef}>{chart}</div>
        </Code>
      </>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.chart === nextProps.chart;
  }
);

export default Mermaid;
