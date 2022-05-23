import { openDB } from "idb";

export const AutoAdd = async (counter, items) => {
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
    let eligibleItems = items?.filter(
      (a) =>
        autobill.items.length === 0 ||
        autobill.items.filter((b) => b === a.item_uuid).length ||
        autobill.item_groups.filter(
          (b) => a.item_groups.filter((c) => c === b).length
        ).length
    );
    console.log(eligibleItems);
  }
  console.log(data);
};
