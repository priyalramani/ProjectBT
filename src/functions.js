import { openDB } from "idb";

export const AutoAddQty = async (counter, items) => {
  let eligibleItems = items;
  const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
  let tx = await db
    .transaction("autobill", "readwrite")
    .objectStore("autobill");
  let autobills = await tx.getAll();

  let data = autobills.filter(
    (a) =>
      a.type === "auto-increase-qty" &&
      (a.counters.filter((b) => b === counter.counter_uuid) ||
        counter.counter_group_uuid.filter(
          (b) => a.counter_groups.filter((c) => c === b).length
        ).length ||
        a.counter.length === 0)
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
export const AutoAddItem = async (counter, items) => {
  let eligibleItems = items;
  const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
  let tx = await db
    .transaction("autobill", "readwrite")
    .objectStore("autobill");
  let autobills = await tx.getAll();
  let store = await db.transaction("items", "readwrite").objectStore("items");
  let dbItems = await store.getAll();
  let data = autobills.filter(
    (a) =>
      a.type === "auto-item-add" &&
      (a.counters.filter((b) => b === counter.counter_uuid) ||
        counter.counter_group_uuid.filter(
          (b) => a.counter_groups.filter((c) => c === b).length
        ).length ||
        a.counter.length === 0)
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
    let eligiblesBox =
      eligibleItems.length < 1
        ? eligibleItems.reduce((a, b) => +a.box + b.box)
        : eligibleItems.length === 1
        ? +eligibleItems[0].box
        : 0;
    let eligiblesPcs =
      eligibleItems.length < 1
        ? eligibleItems.reduce((a, b) => +a.pcs + b.pcs)
        : eligibleItems.length === 1
        ? +eligibleItems[0].pcs
        : 0;

    let base_qty_arr = autobill.qty_details.filter(
      (b) => b.unit === "b" && +b.base_qty <= +eligiblesBox
    );
    base_qty_arr =
      base_qty_arr.length >= autobill.min_range
        ? base_qty_arr.length > 1
          ? base_qty_arr.reduce((a, b) => Math.max(a.base_qty, b.base_qty))
          : base_qty_arr.length === 1
          ? base_qty_arr[0]
          : {}
        : {};
    let pice_qty_arr = autobill.qty_details.filter(
      (b) => b.unit === "p" && +b.base_qty <= +eligiblesPcs
    );
    pice_qty_arr =
      pice_qty_arr.length >= autobill.min_range
        ? pice_qty_arr.length > 1
          ? pice_qty_arr.reduce((a, b) => Math.max(a.base_qty, b.base_qty))
          : pice_qty_arr.length === 1
          ? pice_qty_arr[0]
          : {}
        : {};
    if (base_qty_arr?.add_items) {
      let dataItems = dbItems.filter(
        (a) =>
          base_qty_arr?.add_items.filter((b) => b.item_uuid === a.item_uuid)
            .length
      );
      dataItems = dataItems.map((a) => ({
        ...a,
        box: base_qty_arr?.add_items.filter((b) => b.item_uuid === a.item_uuid)
          .add_qty,
      }));
      let nonFiltered = items.filter(
        (a) => dataItems.filter((b) => a.item_uuid !== b.item_uuid).length
      );
      let Filtered = items
        .filter(
          (a) => dataItems.filter((b) => a.item_uuid === b.item_uuid).length
        )
        .map((a) => ({
          ...a,
          box:
            +(a?.box || 0) +
            (dataItems.find((b) => a.item_uuid !== b.item_uuid)?.box || 0),
        }));
      items = nonFiltered.length
        ? Filtered.length
          ? [...nonFiltered, ...Filtered]
          : [...nonFiltered]
        : Filtered.length
        ? [...Filtered]
        : [];
    }
    if (pice_qty_arr?.add_items) {
      let dataItems = dbItems.filter(
        (a) =>
          pice_qty_arr?.add_items.filter((b) => b.item_uuid === a.item_uuid)
            .length
      );
      dataItems = dataItems.map((a) => ({
        ...a,
        pcs: pice_qty_arr?.add_items.filter((b) => b.item_uuid === a.item_uuid)
          .add_qty,
      }));
      let nonFiltered = items.filter(
        (a) => dataItems.filter((b) => a.item_uuid !== b.item_uuid).length
      );
      let Filtered = items
        .filter(
          (a) => dataItems.filter((b) => a.item_uuid === b.item_uuid).length
        )
        .map((a) => ({
          ...a,
          pcs:
            +(a?.pcs || 0) +
            (dataItems.find((b) => a.item_uuid !== b.item_uuid)?.pcs || 0),
        }));
      items = nonFiltered.length
        ? Filtered.length
          ? [...nonFiltered, ...Filtered]
          : [...nonFiltered]
        : Filtered.length
        ? [...Filtered]
        : [];
    }
  }
  return items;
};
export const Billing = async (counter, items) => {
  let newPriceItems = [];
  for (let item of items) {
    let price =
      counter.item_special_price.find((a) => a.item_uuid === item.item_uuid)
        ?.price || 0;
    let special_discount_percentage =
      counter.item_special_discount.find((a) => a.item_uuid === item.item_uuid)
        ?.discount || 0;
    let company_discount_percentage =
      counter.company_discount.find((a) => a.company_uuid === item.company_uuid)
        ?.discount || 0;
    if (price) item = { ...item, item_price: price };

    if (special_discount_percentage)
      item = { ...item, special_discount_percentage };
    if (company_discount_percentage)
      item = { ...item, company_discount_percentage };
    newPriceItems.push(item);
  }
  console.log(counter);
  return newPriceItems;
};
