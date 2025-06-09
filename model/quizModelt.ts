// const departmentId = '...'; // department you want stats for

// const stats = await QuizResult.aggregate([
//   { $match: { department: mongoose.Types.ObjectId(departmentId) } },
//   {
//     $group: {
//       _id: '$employee',
//       averageScore: { $avg: '$score' },
//     },
//   },
//   {
//     $sort: { averageScore: -1 },
//   },
//   {
//     $lookup: {
//       from: 'users',
//       localField: '_id',
//       foreignField: '_id',
//       as: 'employeeDetails',
//     },
//   },
//   {
//     $project: {
//       employee: { $arrayElemAt: ['$employeeDetails', 0] },
//       averageScore: 1,
//     },
//   },
// ]);
