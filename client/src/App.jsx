import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Transformer,
} from "react-konva";
import { v4 as uuid4 } from "uuid";

const TOOL = {
  SELECT: "select",
  CIRCLE: "circle",
  RECTANGLE: "rectangle",
  LINE: "line",
};
function App() {
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState(TOOL.SELECT);
  const [isDraw, setIsDraw] = useState(false);
  const [newShape, setNewShape] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [savedDrawings, setSavedDrawing] = useState([]);
  const trRef = useRef();
  const layerRef = useRef();

  useEffect(() => {
    if (trRef.current && selectedId) {
      const selectedNode = layerRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, shapes]);

  // useEffect(() => {
  //   const fetchDrawing = async () => {
  //     const res = await fetch("http://localhost:8080/api/drawings");
  //     const data = await res.json();
  //     setSavedDrawing(data);
  //   };
  //   fetchDrawing();
  // }, []);

  //handle mouse up
  const handleMouseUp = () => {
    if (newShape) {
      setShapes([...shapes, newShape]);
      setNewShape(null);
    }
    setIsDraw(null);
  };

  //handle mouse move
  const handleMouseMove = (e) => {
    if (!isDraw || !newShape) return;
    const { x, y } = e.target.getStage().getPointerPosition();

    let updatedShape = { ...newShape };

    if (tool === TOOL.RECTANGLE || tool === TOOL.CIRCLE) {
      updatedShape.width = x - newShape.x;
      updatedShape.height = y - newShape.y;
    } else if (tool === TOOL.LINE) {
      updatedShape.points[2] = x;
      updatedShape.points[3] = y;
    }
    setNewShape(updatedShape);
  };

  //handle mouse down
  const handleMouseDown = (e) => {
    if (tool === TOOL.SELECT) {
      const ClickedOn = e.target;
      if (ClickedOn === e.target.getStage()) {
        setSelectedId(null);
        return;
      }
      const id = ClickedOn.id();
      setSelectedId(id);
      return;
    }
    const { x, y } = e.target.getStage().getPointerPosition();
    const id = uuid4();

    let shape = {
      id,
      type: tool,
      x,
      y,
      width: 0,
      height: 0,
      points: [x, y, x, y],
    };
    setNewShape(shape);
    setIsDraw(true);
  };

  const updateShape = (id, attrs) => {
    let updated = shapes.map((shape) =>
      shape.id === id ? { ...shape, ...attrs } : shape
    );

    setShapes(updated);
  };

  const renderShape = (shape) => {
    const isSelected = shape.id === selectedId;
    const shapeProps = {
      key: shape.id,
      id: shape.id,
      draggable: tool === TOOL.SELECT,
      onClick: () => setSelectedId(shape.id),
      onTap: () => setSelectedId(shape.id),
      onDragEnd: (e) => {
        updateShape(shape.id, { x: e.target.x(), y: e.target.y() });
      },
      onTransformEnd: (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
        });
      },
    };

    switch (shape.type) {
      case TOOL.RECTANGLE:
        return (
          <>
            <Rect
              {...shapeProps}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              stroke="blue"
            />
            {isSelected && <Transformer ref={trRef} />}
            {showAnnotations && (
              <Text
                x={shape.x}
                y={shape.y - 20}
                text={`${Math.abs(shape.width)}*${Math.abs(shape.height)}`}
                fontSize={14}
                fill="black"
              />
            )}
          </>
        );

      case TOOL.CIRCLE:
        const radius =
          Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) / 2;
        return (
          <>
            <Circle
              {...shapeProps}
              x={shape.x + shape.width / 2}
              y={shape.y + shape.height / 2}
              radius={radius}
              stroke="green"
            />
            {isSelected && <Transformer ref={trRef} />}
            {showAnnotations && (
              <Text
                x={shape.x}
                y={shape.y - 20}
                text={`r:${radius.toFixed(1)}`}
                fontSize={14}
                fill="black"
              />
            )}
          </>
        );

      case TOOL.LINE:
        return (
          <>
            <Line
              {...shapeProps}
              points={shape.points}
              stroke="red"
              strokeWidth={2}
            />
            {isSelected && <Transformer ref={trRef} />}
            {showAnnotations && (
              <Text
                x={shape.x}
                y={shape.y - 20}
                text={`len:${Math.hypot(
                  shape.points[2] - shape.points[0],
                  shape.points[3] - shape.points[1]
                ).toFixed(1)}`}
                fontSize={14}
                fill="black"
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  //save current canvas
  const saveDrawing = async () => {
    const name = prompt("Enter drawing name:");
    if (!name) return;
    try {
      const res = await fetch("http://localhost:8080/api/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shapes }),
      });
      const data = await res.json();
      alert("Drawing saved" + data._id);
    } catch (error) {
      console.log(error);
    }
  };

  //load drawing from db

  const loadDrawing = async () => {
    const drawingId = prompt("Enter drawing by id to load");
    if (!drawingId) {
      const res = await fetch(
        `http://localhost:8080/api/drawings/${drawingId}`
      );
      if (!res.ok) {
        alert("Drawing not found");
        return;
      }
      const data = await res.json();
      setShapes(data.shapes);
      alert("Drawing loaded", +data.name);
    }
  };

  // const handleLoadDrawing = async (drawingId) => {
  //   if (!drawingId) return;
  //   const res = await fetch(`http://localhost:8080/api/drawings/${drawingId}`);
  //   const data = await res.json();
  //   setShapes(data.shapes);
  //   alert("drawing loaded");
  // };
  return (
    <>
      <div style={{ padding: "4px" }}>
        <div style={{ display: "flex", gap: "2px", marginBottom: "4px" }}>
          <button onClick={() => setTool(TOOL.SELECT)}>Select</button>
          <button onClick={() => setTool(TOOL.RECTANGLE)}>Rectangle</button>
          <button onClick={() => setTool(TOOL.CIRCLE)}>Circle</button>
          <button onClick={() => setTool(TOOL.LINE)}>Line</button>
          <button onClick={() => setShowAnnotations(!showAnnotations)}>
            {showAnnotations ? "hide" : "show"}
            Annotations
          </button>

          {/* <div style={{ marginBottom: "4px" }}>
            <label>Select drawing to load:</label>
            <select onChange={(e) => handleLoadDrawing(e.target.value)}>
              <option value="">Choose</option>
              {savedDrawings.map((drawing) => (
                <option key={drawing._id} value={drawing._id}>
                  {drawing.name} ({new Date(drawing.createdAt).toLocaleString()}
                  )
                </option>
              ))}
            </select>
          </div> */}
        </div>

        <div style={{ display: "flex", gap: "2px", marginBottom: "4" }}>
          <button onClick={saveDrawing}>Save Drawing</button>
          <button onClick={loadDrawing}>Load Drawing</button>
        </div>
        <Stage
          width={window.innerWidth * 0.9}
          height={window.innerWidth * 0.9}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          style={{ border: "1px solid gray", backgroundColor: "grey" }}
        >
          <Layer ref={layerRef}>
            {shapes.map((shape) => renderShape(shape))}
            {newShape && renderShape(newShape)}
          </Layer>
        </Stage>
      </div>
    </>
  );
}

export default App;
