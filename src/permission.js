
const { getUsers } = require('./controllers/lib/users');
const { RoleModel } = require('./models/collections/roles');
const { APIError } = require('./controllers/lib/_errors');

const permissionMiddleware = async (req, res, next, permission) => {

  try {

    const { id: userId } = req.user;

    // get user role
    const [user] = await getUsers(userId);
    if (!user) throw new APIError(`The user with id ${userId} could not be found/is not authorized`, 403, 'UserRoleError');
    const { role } = user;
    if (!role) throw new APIError('The user does not have a specified role', 403, 'UserRoleError');

    // get role permissions
    const [dbRole] = await RoleModel.find({ name: role });
    if (!dbRole) throw new APIError('The user does not have a valid role', 403, 'UserRoleError');
    const { permissions: dbPermissions } = dbRole;

    let hasPermission = false;

    // check user permissions
    if (dbPermissions.includes(`${permission}/ALL`)) {

      // pass boolean into the request
      hasPermission = true;
      req.admin = true;

    }
    else if (dbPermissions.includes(permission)) {

      hasPermission = true;

    }

    if (!hasPermission) throw new APIError('The user does not have the required permissions to access that resource', 403, 'UserPermissionError');

    return next();

  }
  catch (err) {

    console.debug({ err });
    return res.status(err.status || 500).json(err);

  }

};

exports.permissionMiddleware = permissionMiddleware;
