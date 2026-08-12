"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosModule = void 0;
const common_1 = require("@nestjs/common");
const usuarios_controller_1 = require("./usuarios.controller");
const usuarios_service_1 = require("./usuarios.service");
@(0, common_1.Module)({
    controllers: [usuarios_controller_1.UsuariosController],
    providers: [usuarios_service_1.UsuariosService]
})
class UsuariosModule {
}
exports.UsuariosModule = UsuariosModule;
//# sourceMappingURL=usuarios.module.js.map