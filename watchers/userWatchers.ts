import Department from '../model/departmentModel';
import User from '../model/userModel';

const userChangeStream = User.watch([], { fullDocument: 'updateLookup' });

userChangeStream.on('change', async (change) => {
  if (change.operationType !== 'update') return;

  const updatedUser = change.fullDocument;
  if (!updatedUser || updatedUser.role !== 'departmentAdmin') return;

  try {
    // Use the cloudConnection to find and update the related department
    const department = await Department.findById(updatedUser.departmentId);
    if (!department) return;

    // Update departmentAdmin
    department.departmentAdmin = {
      id: updatedUser._id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
    };

    // Update employee list role
    const employee = department.employees.find((e) =>
      e.id.equals(updatedUser._id),
    );
    if (employee) {
      employee.role = 'departmentAdmin';
    }

    await department.save();
    console.log(`Synced departmentAdmin in department ${department.name}`);
  } catch (err) {
    console.error('Sync error:', err);
  }
});
