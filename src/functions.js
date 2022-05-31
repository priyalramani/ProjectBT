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
      (a?.counters?.filter((b) => b === counter.counter_uuid)?.length ||
        counter?.counter_group_uuid?.filter(
          (b) => a?.counter_groups.filter((c) => c === b)?.length
        ).length ||
        a?.counters?.length === 0)
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
        base_qty_arr =
          base_qty_arr.length > 1
            ? base_qty_arr.reduce((a, b) =>
                +Math.max(a.base_qty, b.base_qty) === +a.base_qty ? a : b
              )
            : base_qty_arr.length === 1
            ? base_qty_arr[0]
            : null;
        let pice_qty_arr = autobill.qty_details.filter(
          (b) => b.unit === "p" && +b.base_qty <= +a.pcs
        );
        pice_qty_arr =
          pice_qty_arr.length > 1
            ? pice_qty_arr.reduce((a, b) =>
                +Math.max(a.base_qty, b.base_qty) === +a.base_qty ? a : b
              )
            : pice_qty_arr.length === 1
            ? pice_qty_arr[0]
            : {};
        pice_qty_arr = base_qty_arr ? {} : pice_qty_arr;
        if (base_qty_arr || pice_qty_arr)
          auto_added.push({
            item_uuid: a.item_uuid,
            b: base_qty_arr?.add_qty ? +base_qty_arr?.add_qty : 0,
            p: pice_qty_arr?.add_qty ? +pice_qty_arr?.add_qty : 0,
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
      (a.counters.filter((b) => b === counter.counter_uuid).length ||
        counter.counter_group_uuid.filter(
          (b) => a.counter_groups.filter((c) => c === b).length
        ).length ||
        a.counter.length === 0)
  );

  for (let autobill of data) {
    let eligibleAddItems = eligibleItems?.filter(
      (a) =>
        autobill.items.length === 0 ||
        autobill.items.filter((b) => b === a.item_uuid).length ||
        autobill.item_groups.filter(
          (b) => a.item_group_uuid.filter((c) => c === b).length
        ).length
    );
    console.log("eligible", eligibleAddItems);
    let eligiblesBox =
      eligibleAddItems.length > 1
        ? eligibleAddItems.map(a => a.box).reduce((a, b) => a + b)
        : eligibleAddItems.length === 1
        ? +eligibleAddItems[0].box
        : 0;
    //console.log("eligibleBox", eligiblesBox);
    let eligiblesPcs =
      eligibleAddItems.length > 1
        ? eligibleAddItems.map(a => a.pcs).reduce((a, b) => a + b)
        : eligibleAddItems.length === 1
        ? +eligibleAddItems[0].pcs
        : 0;
    // console.log("eligiblePcs", eligiblesPcs);

    let base_qty_arr = autobill.qty_details.filter(
      (b) => b.unit === "b" && +b.base_qty <= eligiblesBox
    );
    //console.log("baseqtyarr", base_qty_arr);
    base_qty_arr =
      eligibleAddItems.length >= autobill.min_range
        ? base_qty_arr.length > 1
          ? base_qty_arr.reduce((a, b) =>
              +Math.max(a.base_qty, b.base_qty) === +a.base_qty ? a : b
            )
          : base_qty_arr.length === 1
          ? base_qty_arr[0]
          : null
        : null;
    //console.log("baseqtyobj", base_qty_arr);
    let pice_qty_arr = autobill.qty_details.filter(
      (b) => b.unit === "p" && +b.base_qty <= eligiblesPcs
    );
    console.log("piceqtyarr", pice_qty_arr);
    pice_qty_arr =
    eligibleAddItems.length >= autobill.min_range
        ? pice_qty_arr.length > 1
          ? pice_qty_arr.reduce((a, b) =>
              +Math.max(a.base_qty, b.base_qty) === +a.base_qty ? a : b
            )
          : pice_qty_arr.length === 1
          ? pice_qty_arr[0]
          : null
        : null;
    console.log("piceqtyobj", pice_qty_arr);

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
          auto_added.push({ ...data, b: data.add_qty || 0 });
        }
        return {
          ...a,
          box: base_qty_arr?.add_items.find((b) => b.item_uuid === a.item_uuid)
            .add_qty,
        };
      });
      let nonFiltered = eligibleItems.filter(
        (a) => !(dataItems.filter((b) => a.item_uuid === b.item_uuid).length)
      );
      dataItems = dataItems.map((a) => {
        let data = eligibleItems.find((b) => a.item_uuid === b.item_uuid);
        return {
          ...a,
          pcs: (data ? +a.pcs + data.pcs : a.pcs) || 0,
          box: (data ? +a.box + data.box : a.box) || 0,
        };
      });
     
      eligibleItems = nonFiltered.length
        ? dataItems.length
          ? [...nonFiltered, ...dataItems]
          : nonFiltered
        : dataItems.length
        ? dataItems
        : [];
    }
    if (pice_qty_arr?.add_items) {
      let dataItems = dbItems.filter(
        (a) =>
          pice_qty_arr?.add_items.filter((b) => b.item_uuid === a.item_uuid)
            .length
      );
      //console.log("datapiceItems", dataItems);
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
      //console.log("datapiceItems", dataItems);

      let nonFiltered = eligibleItems.filter(
        (a) => !dataItems.filter((b) => a.item_uuid === b.item_uuid).length
      );

      dataItems = dataItems.map((a) => {
        let data = eligibleItems.find((b) => a.item_uuid === b.item_uuid);
        return {
          ...a,
          pcs: (data ? +a.pcs + data.pcs : a.pcs) || 0,
          box: (data ? +a.box + data.box : a.box) || 0,
        };
      });
      //console.log(nonFiltered, dataItems);
      eligibleItems = nonFiltered.length
        ? dataItems.length
          ? [...nonFiltered, ...dataItems]
          : nonFiltered
        : dataItems.length
        ? dataItems
        : [];
    }
  }

  return {
    counter_uuid: counter.counter_uuid,
    auto_added,
    items: eligibleItems,
  };
};

export const Billing = async (counter = {}, items = [], others = null) => {
  let newPriceItems = [];
  for (let item of items) {
    //console.log(
    //   item,
    //   others,
    //   +item.conversion * +item.box + item.pcs,
    //   +item.conversion * +item.b + item.p
    // );
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
        console.log("company_discount_percentage",company_discount_percentage)
    item = {
      ...item,
      qty: others
        ? +item.conversion * +item.box + item.pcs
        : +item.conversion * +item.b + item.p,
    };
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
          ((item.item_price||0) * ((100 - special_discount_percentage) / 100)) || 0,
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
          ? item.item_total * ((100 - company_discount_percentage) / 100) || 0
          : (item.item_price||0) * ((100 - company_discount_percentage) / 100) || 0,
      };
    }

    if (!special_discount_percentage && !company_discount_percentage)
      item = {
        ...item,
        item_total:
          (
            (item.item_price||0) *
            (others
              ? +item.box * +item.conversion + item.pcs
              : +item.b * +item.conversion + item.p)
          ).toFixed(2) || 0,
      };
    item = {
      ...item,
      charges_discount,
      item_total: ((item.item_total || 0) * (item.qty || 1)).toFixed(2),
    };
    console.log(item);
    newPriceItems.push(item);
  }
  let order_grandtotal =
    newPriceItems.length > 1
      ? newPriceItems.reduce(
          (a, b) => (+a.item_total || 0) + (+b.item_total || 0)
        )
      : newPriceItems.length
      ? newPriceItems.map((a) => a.item_total)[0] || 0
      : 0;
  return {
    counter_uuid: counter.counter_uuid,
    order_grandtotal,
    items: newPriceItems,
    others,
  };
};
