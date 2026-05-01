export const publicJobCriteria = {
  $and: [
    { $or: [{ status: 'published' }, { status: { $exists: false } }] },
    { $or: [{ moderationStatus: 'approved' }, { moderationStatus: { $exists: false } }] }
  ]
};

export const publicJobById = (id: string) => ({
  _id: id,
  ...publicJobCriteria
});
