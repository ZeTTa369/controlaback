"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContratosModule = void 0;
const common_1 = require("@nestjs/common");
const contratos_controller_1 = require("./contratos.controller");
const contratos_service_1 = require("./contratos.service");
@(0, common_1.Module)({
    controllers: [contratos_controller_1.ContratosController],
    providers: [contratos_service_1.ContratosService]
})
class ContratosModule {
}
exports.ContratosModule = ContratosModule;
//# sourceMappingURL=contratos.module.js.map