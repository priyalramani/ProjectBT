import { openDB } from "idb";

export const AutoAdd = async (counter, items) => {
  let eligibleItems = items;
  let auto_added = [];
  const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
  let tx = await db
    .transaction("autobill", "readwrite")
    .objectStore("autobill");
  let autobills = await tx.getAll();
  let store = await db.transaction("items", "readwrite").objectStore("items");
  let dbItems = await store.getAll();
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
    eligibleItems = eligibleItems.map((a) => {
      if (
        autobill.items.length === 0 ||
        autobill.items.filter((b) => b === a.item_uuid).length ||
        autobill.item_groups.filter(
          (b) => a.item_group_uuid.filter((c) => c === b).length
        ).length
      ) {
        let base_qty_arr = autobill.qty_details.filter(
          (b) => b.unit === "b" && +b.base_qty <= +a.box
        );
        console.log("autobill.qty_details.filter",base_qty_arr)
        base_qty_arr =
        base_qty_arr.length > 1
        ? base_qty_arr.reduce((a, b) => +Math.max(a.base_qty, b.base_qty)===+a.base_qty?a:b)
        : base_qty_arr.length === 1
        ? base_qty_arr[0]
        : null;
        console.log("autobill.qty_details.max",base_qty_arr)
        let pice_qty_arr = autobill.qty_details.filter(
          (b) => b.unit === "p" && +b.base_qty <= +a.pcs
        );
        console.log("autobill.qty_details.filter",pice_qty_arr)
        pice_qty_arr =
          pice_qty_arr.length > 1
            ? pice_qty_arr.reduce((a, b) => +Math.max(a.base_qty, b.base_qty)===+a.base_qty?a:b)
            : pice_qty_arr.length === 1
            ? pice_qty_arr[0]
            : {};
            console.log("autobill.qty_details.max",base_qty_arr)
        pice_qty_arr = base_qty_arr ? {} : pice_qty_arr;
        if (base_qty_arr || pice_qty_arr)
          auto_added.push({
            item_uuid: a.item_uuid,
            box: base_qty_arr?.add_qty ? +base_qty_arr?.add_qty : 0,
            pcs: pice_qty_arr?.add_qty ? +pice_qty_arr?.add_qty : 0,
          });
        return {
          ...a,
          box: +a.box + (base_qty_arr?.add_qty ? +base_qty_arr?.add_qty : 0),
          pcs: +a.pcs + (pice_qty_arr?.add_qty ? +pice_qty_arr?.add_qty : 0),
        };
      } else return a;
    });
  }
  data = autobills.filter(
    (a) =>
      a.type === "auto-item-add" &&
      (a.counters.filter((b) => b === counter.counter_uuid) ||
        counter.counter_group_uuid.filter(
          (b) => a.counter_groups.filter((c) => c === b).length
        ).length ||
        a.counter.length === 0)
  );

  for (let autobill of data) {
    eligibleItems = eligibleItems?.filter(
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
      dataItems = dataItems.map((a) => {
        if (base_qty_arr?.add_items.find((b) => b.item_uuid === a.item_uuid)) {
          let data = base_qty_arr?.add_items.find(
            (b) => b.item_uuid === a.item_uuid
          );
          auto_added.push({ ...data, q: data.add_qty || 0 });
        }
        return {
          ...a,
          box: base_qty_arr?.add_items.find((b) => b.item_uuid === a.item_uuid)
            .add_qty,
        };
      });
      let nonFiltered = eligibleItems.filter(
        (a) => dataItems.filter((b) => a.item_uuid !== b.item_uuid).length
      );
      let Filtered = items
        .filter(
          (a) => dataItems.filter((b) => a.item_uuid === b.item_uuid).length
        )
        .map((a) => {
          return {
            ...a,
            box:
              +(a?.box || 0) +
              (dataItems.find((b) => a.item_uuid !== b.item_uuid)?.box || 0),
          };
        });
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
      dataItems = dataItems.map((a) => {
        if (pice_qty_arr?.add_items.find((b) => b.item_uuid === a.item_uuid)) {
          let data = pice_qty_arr?.add_items.find(
            (b) => b.item_uuid === a.item_uuid
          );
          auto_added.push({ ...data, p: data.add_qty || 0 });
        }
        return {
          ...a,
          pcs: pice_qty_arr?.add_items.find((b) => b.item_uuid === a.item_uuid)
            .add_qty,
        };
      });
      let nonFiltered = eligibleItems.filter(
        (a) => dataItems.filter((b) => a.item_uuid !== b.item_uuid).length
      );
      let Filtered = eligibleItems
        .filter(
          (a) => dataItems.filter((b) => a.item_uuid === b.item_uuid).length
        )
        .map((a) => ({
          ...a,
          pcs:
            +(a?.pcs || 0) +
            (dataItems.find((b) => a.item_uuid !== b.item_uuid)?.pcs || 0),
        }));
      eligibleItems = nonFiltered.length
        ? Filtered.length
          ? [...nonFiltered, ...Filtered]
          : [...nonFiltered]
        : Filtered.length
        ? [...Filtered]
        : [];
    }
  }

  return {
    counter_uuid: counter.counter_uuid,
    auto_added,
    items: eligibleItems,
  };
};

export const Billing = async (counter={}, items=[], others={}) => {
  let newPriceItems = [];

  for (let item of items) {
    let charges_discount = [];
    let price =
      counter.item_special_price.find((a) => a.item_uuid === item.item_uuid)
        ?.price || 0;
    let special_discount_percentage =
      counter.item_special_discount.find((a) => a.item_uuid === item.item_uuid)
        ?.discount || 0;
    let company_discount_percentage =
      counter.company_discount.find((a) => a.company_uuid === item.company_uuid)
        ?.discount || 0;
    item = { ...item, qty: +item.conversion * +item.box + item.pcs };
    if (price) item = { ...item, item_price: price };

    if (special_discount_percentage) {
      charges_discount.push({
        title: "Special Discount",
        value: special_discount_percentage,
      });
      item = {
        ...item,
        special_discount_percentage,
        item_total:
          item.item_price * ((100 - special_discount_percentage) / 100),
      };
    }
    if (company_discount_percentage) {
      charges_discount.push({
        title: "Company Discount",
        value: company_discount_percentage,
      });
      item = {
        ...item,
        company_discount_percentage,
        item_total: item.item_total
          ? item.item_total * ((100 - company_discount_percentage) / 100)
          : item.item_price * ((100 - company_discount_percentage) / 100),
      };
    }

    if (!special_discount_percentage && !company_discount_percentage)
      item = { ...item, item_total: item.item_price };
    item = { ...item, charges_discount };
    newPriceItems.push(item);
  }

  return { counter_uuid: counter.counter_uuid, items: newPriceItems, others };
};
