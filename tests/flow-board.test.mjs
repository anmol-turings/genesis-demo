import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

function loadBoardData() {
  const source = fs.readFileSync("design/flow-board/board-data.js", "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.FLOW_BOARD;
}

function readPngDimensions(filePath) {
  const header = fs.readFileSync(filePath).subarray(0, 24);
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.ok(header.subarray(0, 8).equals(pngSignature), `${filePath} is not a PNG`);
  assert.equal(header.toString("ascii", 12, 16), "IHDR", `${filePath} has no IHDR header`);
  return {
    width: header.readUInt32BE(16),
    height: header.readUInt32BE(20),
  };
}

test("manifest contains the approved 16 frames", () => {
  const board = loadBoardData();
  assert.equal(board.frames.length, 16);
  assert.deepEqual(
    [...new Set(board.frames.map((frame) => frame.lane))],
    ["entry", "setup", "daily", "cohort"],
  );
  assert.equal(new Set(board.frames.map((frame) => frame.id)).size, 16);
});

test("current and proposed frames are correctly separated", () => {
  const board = loadBoardData();
  assert.equal(board.frames.filter((frame) => frame.status === "current").length, 12);
  assert.equal(board.frames.filter((frame) => frame.status === "unavailable").length, 1);
  assert.equal(board.frames.filter((frame) => frame.status === "revised").length, 1);
  assert.equal(board.frames.filter((frame) => frame.status === "new").length, 2);
});

test("manifest contains the required cohort screens", () => {
  const board = loadBoardData();
  const ids = new Set(board.frames.map((frame) => frame.id));
  for (const id of ["dashboard-cohort", "cohort-progress", "program-summary"]) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});

test("all current frames reference captured assets", () => {
  const board = loadBoardData();
  for (const frame of board.frames.filter((item) => item.status === "current")) {
    assert.match(frame.asset, /^assets\/current\/.+\.png$/);
    const assetPath = `design/flow-board/${frame.asset}`;
    assert.ok(fs.existsSync(assetPath), `missing current asset ${assetPath}`);
  }
});

test("all supplied screen assets are exactly 430 by 932 pixels", () => {
  const board = loadBoardData();
  for (const frame of board.frames.filter((item) => item.asset)) {
    const assetPath = `design/flow-board/${frame.asset}`;
    assert.ok(fs.existsSync(assetPath), `missing screen asset ${assetPath}`);
    assert.deepEqual(readPngDimensions(assetPath), { width: 430, height: 932 });
  }
});

test("constellation frame is explicitly marked as unavailable evidence", () => {
  const board = loadBoardData();
  const frame = board.frames.find((item) => item.id === "constellation");
  assert.equal(frame.status, "unavailable");
  assert.equal(frame.availability, "not-available");
  assert.match(frame.purpose, /no current destination supplies learning data/i);
  assert.ok(
    board.connectors
      .filter((connector) => connector.from === frame.id || connector.to === frame.id)
      .every((connector) => connector.kind === "unavailable"),
  );
});

test("connectors reference valid frames", () => {
  const board = loadBoardData();
  const ids = new Set(board.frames.map((frame) => frame.id));
  for (const connector of board.connectors) {
    assert.ok(ids.has(connector.from), `unknown connector source ${connector.from}`);
    assert.ok(ids.has(connector.to), `unknown connector target ${connector.to}`);
    assert.ok(["current", "proposed", "return", "unavailable"].includes(connector.kind));
  }
});
