"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagosModule = void 0;
const common_1 = require("@nestjs/common");
const pagos_controller_1 = require("./pagos.controller");
const pagos_service_1 = require("./pagos.service");
@(0, common_1.Module)({
    controllers: [pagos_controller_1.PagosController],
    providers: [pagos_service_1.PagosService]
})
class PagosModule {
}
exports.PagosModule = PagosModule;
//# sourceMappingURL=pagos.module.js.map