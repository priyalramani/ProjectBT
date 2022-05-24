import { openDB } from "idb";

export const AutoAdd = async (counter, items) => {
  let eligibleItems = items;
  const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
  let tx = await db
    .transaction("autobill", "readwrite")
    .objectStore("autobill");
  let autobills = await tx.getAll();
  let data = autobills.filter(
    (a) =>
      a.counters.filter((b) => b === counter.counter_uuid) ||
      counter.counter_group_uuid.filter(
        (b) => a.counter_groups.filter((c) => c === b).length
      ).length ||
      a.counter.length === 0
  );

  for (let autobill of data) {
    eligibleItems = items?.filter(
      (a) =>
        autobill.items.length === 0 ||
        autobill.items.filter((b) => b === a.item_uuid).length ||
        autobill.item_groups.filter(
          (b) => a.item_group_uuid.filter((c) => c === b).length
        ).length
    );
    eligibleItems = eligibleItems.map((a) => {
      let base_qty_arr = autobill.qty_details.filter(
        (b) => b.unit === "b" && +b.base_qty <= +a.box
      );
      base_qty_arr =
        base_qty_arr.length > 1
          ? base_qty_arr.reduce((a, b) => Math.max(a.base_qty, b.base_qty))
          : base_qty_arr.length === 1
          ? base_qty_arr[0]
          : {};
      let pice_qty_arr = autobill.qty_details.filter(
        (b) => b.unit === "p" && +b.base_qty <= +a.pcs
      );
      pice_qty_arr =
        pice_qty_arr.length > 1
          ? pice_qty_arr.reduce((a, b) => Math.max(a.base_qty, b.base_qty))
          : pice_qty_arr.length === 1
          ? pice_qty_arr[0]
          : {};
      pice_qty_arr = base_qty_arr ? {} : pice_qty_arr;
      return {
        ...a,
        box: +a.box + (base_qty_arr?.add_qty ? +base_qty_arr?.add_qty : 0),
        pcs: +a.pcs + (pice_qty_arr?.add_qty ? +pice_qty_arr?.add_qty : 0),
      };
    });
    // console.log("eligibleItems",eligibleItems,autobill.qty_details);
  }
  return items.map((a) =>
    eligibleItems.filter((b) => a.item_uuid === b.item_uuid).length
      ? eligibleItems.find((b) => a.item_uuid === b.item_uuid)
      : a
  );
};
