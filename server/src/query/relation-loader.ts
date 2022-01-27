import Dataloader from "dataloader";
import { groupBy } from "ramda";
export const RelationLoader = () => new Dataloader(relationCallback);

const authors = [
  { id: "1", name: "J. K. Rowling" },
  { id: "2", name: "J. R. R. Tolkien" },
  { id: "3", name: "Brent Weeks" },
];

const books = [
  { id: "1", name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: "2", name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: "3", name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: "4", name: "The Fellowship of the Ring", authorId: 2 },
  { id: "5", name: "The Two Towers", authorId: 2 },
  { id: "6", name: "The Return of the King", authorId: 2 },
  { id: "7", name: "The Way of Shadows", authorId: 3 },
  { id: "8", name: "Beyond the Shadows", authorId: 3 },
];

function relationCallback(relationIds) {
  // authorIds: [ 1, 2, 3 ]
  console.log("authorIds:", relationIds);

  // 根据 ids 查找：满足作者 id 被 authorIds 包含的作者数据。 返回数组。
  let authorList = authors.filter((item) => relationIds.includes(item.id));

  // 通过 groupBy 整理作者数据为对象
  /*  groupById
      {
          '1': [ { id: 1, name: 'J. K. Rowling' } ],
          '2': [ { id: 2, name: 'J. R. R. Tolkien' } ],
          '3': [ { id: 3, name: 'Brent Weeks' } ]
      }
   */
  const groupById = groupBy((item) => item.id, authorList);

  // 整理数据，让 authorList 按照 authorIds 中的 id 排序
  /*
      [ { id: 1, name: 'J. K. Rowling' },
      { id: 2, name: 'J. R. R. Tolkien' },
      { id: 3, name: 'Brent Weeks' } ]
   */
  authorList = relationIds.map((item: string | number) => groupById[item][0]);

  return Promise.resolve(authorList);
}
