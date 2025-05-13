import React, { useState, useEffect, useRef } from "react";

export default function ImagePuzzle() {
    const [image, setImage] = useState(null);
    const [tiles, setTiles] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    const TILE_SIZE = 100;
    const GRID_SIZE = 3;

    useEffect(() => {
        if (startTime && !isComplete) {
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [startTime, isComplete]);

    const shuffleTiles = () => {
        const shuffled = Array.from({ length: 9 }, (_, i) => ({
            id: i,
            rotation: Math.floor(Math.random() * 4) * 90,
        }));
        setTiles(shuffled);
        setIsComplete(false);
        setElapsedTime(0);
        setStartTime(Date.now());
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
            setTimeout(shuffleTiles, 100); // Delay shuffle to let image load
        }
    };

    const handleTileClick = (id) => {
        if (isComplete) return;
        setTiles((prev) => {
            const updated = prev.map((tile) =>
                tile.id === id
                    ? {
                        ...tile,
                        rotation: (tile.rotation + 90) % 360,
                        key: Math.random(), // force re-render to correct animation direction
                    }
                    : tile
            );
            const allCorrect = updated.every((tile) => tile.rotation % 360 === 0);
            if (allCorrect) {
                setIsComplete(true);
                clearInterval(timerRef.current);
            }
            return updated;
        });
    };

    return (
        <div style={{ padding: 20, textAlign: "center" }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && (
                <div>
                    {isComplete && (
                        <p style={{ color: "green", fontWeight: "bold" }}>
                            🎉 Картинка собрана за {elapsedTime} секунд!
                        </p>
                    )}
                    {!isComplete && (
                        <p style={{ fontStyle: "italic" }}>⏱ Время: {elapsedTime} сек</p>
                    )}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
                            gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
                            gap: 0,
                            width: TILE_SIZE * GRID_SIZE,
                            height: TILE_SIZE * GRID_SIZE,
                            margin: "20px auto",
                            border: isComplete ? "none" : "2px solid #999",
                            transition: "border 0.3s ease-in-out",
                        }}
                    >
                        {tiles.map((tile) => (
                            <div
                                key={tile.key || tile.id}
                                onClick={() => handleTileClick(tile.id)}
                                style={{
                                    width: TILE_SIZE,
                                    height: TILE_SIZE,
                                    overflow: "hidden",
                                    border: isComplete ? "none" : "1px solid #ccc",
                                    boxSizing: "border-box",
                                    cursor: isComplete ? "default" : "pointer",
                                    transformStyle: "preserve-3d",
                                }}
                            >
                                <div
                                    style={{
                                        width: TILE_SIZE,
                                        height: TILE_SIZE,
                                        transform: `rotate(${tile.rotation}deg)`,
                                        transformOrigin: "center center",
                                        transition: "transform 0.3s ease-in-out",
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundImage: `url(${image})`,
                                            backgroundSize: `${TILE_SIZE * GRID_SIZE}px ${TILE_SIZE * GRID_SIZE}px`,
                                            width: TILE_SIZE,
                                            height: TILE_SIZE,
                                            backgroundPosition: `${-(tile.id % GRID_SIZE) * TILE_SIZE}px ${-Math.floor(tile.id / GRID_SIZE) * TILE_SIZE}px`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isComplete && (
                        <button
                            onClick={shuffleTiles}
                            style={{ marginTop: 20, padding: "10px 20px", fontSize: 16 }}
                        >
                            🔁 Перемешать снова
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}