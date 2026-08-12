"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartamentosModule = void 0;
const common_1 = require("@nestjs/common");
const departamentos_controller_1 = require("./departamentos.controller");
const departamentos_service_1 = require("./departamentos.service");
@(0, common_1.Module)({
    controllers: [departamentos_controller_1.DepartamentosController],
    providers: [departamentos_service_1.DepartamentosService]
})
class DepartamentosModule {
}
exports.DepartamentosModule = DepartamentosModule;
//# sourceMappingURL=departamentos.module.js.map