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
  assert.equal(board.frames.filter((frame) => frame.status === "current").length, 13);
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
  }
});

test("connectors reference valid frames", () => {
  const board = loadBoardData();
  const ids = new Set(board.frames.map((frame) => frame.id));
  for (const connector of board.connectors) {
    assert.ok(ids.has(connector.from), `unknown connector source ${connector.from}`);
    assert.ok(ids.has(connector.to), `unknown connector target ${connector.to}`);
    assert.ok(["current", "proposed", "return"].includes(connector.kind));
  }
});
