import Department from '../model/departmentModel';
import User from '../model/userModel';

const userChangeStream = User.watch([{ $match: { operationType: 'update' } }], {
  fullDocument: 'updateLookup',
});

export const watchUserChanges = () => {
  userChangeStream.on('change', async (change) => {
    // console.log('User change detected:', change);
    if (change.operationType !== 'update') return;

    const updatedUser = change.fullDocument;
    if (!updatedUser || !updatedUser.departmentId) return;

    try {
      const department = await Department.findById(updatedUser.departmentId);
      if (!department) return;

      // 1. Update departmentAdmin if user is a department admin
      // console.log(updatedUser);
      if (
        updatedUser._id.toString() ===
        department.departmentAdmin?.id?.toString()
      ) {
        if (updatedUser.role === 'departmentAdmin')
          department.departmentAdmin = {
            id: updatedUser._id,
            name: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
            phoneNumber: updatedUser.phoneNumber,
          };
        else {
          department.departmentAdmin = undefined;
          console.log('makeing deparment admin undefined');
        }
      }

      // 2. Update user in employee list
      const employee = department.employees.find((e) =>
        e.id.equals(updatedUser._id),
      );

      if (employee) {
        employee.name = updatedUser.fullName;
        employee.email = updatedUser.email;
        employee.role = updatedUser.role; // Could be admin or employee
      } else {
        // Add to employees if not found
        department.employees.push({
          id: updatedUser._id,
          name: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
        });
        console.log(
          `Added new employee ${updatedUser.fullName} to department ${department.name}`,
        );
      }

      await department.save();
      console.log(
        `Synced user ${updatedUser.fullName} in department ${department.name}`,
      );
    } catch (err) {
      console.error('Sync error:', err);
    }
  });

  console.log('User change stream started, watching for updates...');
};
