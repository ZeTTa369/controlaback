"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
@(0, common_1.Module)({
    controllers: [auth_controller_1.AuthController],
    providers: [auth_service_1.AuthService]
})
class AuthModule {
}
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map