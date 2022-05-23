import { openDB } from "idb";

export const AutoAdd = async (counter, item) => {
  const db = await openDB("BT", +localStorage.getItem("IDBVersion") || 1);
  let tx = await db
    .transaction("autobill", "readwrite")
    .objectStore("autobill");
  let autobill = await tx.getAll();
  let data = autobill.filter(
    (a) =>
      a.counters.filter((b) => b === counter.counter_uuid) ||
      counter.counter_group_uuid.filter(
        (b) => a.counter_groups.filter((c) => c === b).length
      ).length ||
      a.counter.length === 0
  );
  console.log(data);
};
