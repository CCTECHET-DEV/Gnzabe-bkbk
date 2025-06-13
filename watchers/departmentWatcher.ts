import Department from '../model/departmentModel';
import Company from '../model/companyModel';
import mongoose from 'mongoose';

export const watchDepartmentChanges = () => {
  const changeStream = Department.watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', async (change) => {
    const dept = change.fullDocument;

    try {
      switch (change.operationType) {
        case 'insert':
          await Company.findByIdAndUpdate(dept.companyId, {
            $addToSet: {
              departments: { id: dept._id, name: dept.name },
            },
          });
          console.log(`➕ Department added to company: ${dept.name}`);
          break;

        case 'update':
          if (!dept) return;

          await Company.updateOne(
            { _id: dept.companyId, 'departments.id': dept._id },
            {
              $set: {
                'departments.$.name': dept.name,
              },
            },
          );

          console.log(`✏️ Department name updated in company: ${dept.name}`);
          break;

        case 'delete':
          const deletedDeptId = new mongoose.Types.ObjectId(
            change.documentKey._id,
          );
          await Company.updateMany(
            { 'departments.id': deletedDeptId },
            {
              $pull: {
                departments: { id: deletedDeptId },
              },
            },
          );
          console.log(`❌ Department removed from company`);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('❌ Error syncing department to company:', err);
    }
  });

  console.log('👀 Watching department changes...');
};
