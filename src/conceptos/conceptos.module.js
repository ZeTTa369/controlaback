"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConceptosModule = void 0;
const common_1 = require("@nestjs/common");
const conceptos_controller_1 = require("./conceptos.controller");
const conceptos_service_1 = require("./conceptos.service");
@(0, common_1.Module)({
    controllers: [conceptos_controller_1.ConceptosController],
    providers: [conceptos_service_1.ConceptosService]
})
class ConceptosModule {
}
exports.ConceptosModule = ConceptosModule;
//# sourceMappingURL=conceptos.module.js.map