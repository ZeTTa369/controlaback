"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CobrosModule = void 0;
const common_1 = require("@nestjs/common");
const cobros_controller_1 = require("./cobros.controller");
const cobros_service_1 = require("./cobros.service");
@(0, common_1.Module)({
    controllers: [cobros_controller_1.CobrosController],
    providers: [cobros_service_1.CobrosService]
})
class CobrosModule {
}
exports.CobrosModule = CobrosModule;
//# sourceMappingURL=cobros.module.js.map