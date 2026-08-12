"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefaccionesModule = void 0;
const common_1 = require("@nestjs/common");
const refacciones_controller_1 = require("./refacciones.controller");
const refacciones_service_1 = require("./refacciones.service");
@(0, common_1.Module)({
    controllers: [refacciones_controller_1.RefaccionesController],
    providers: [refacciones_service_1.RefaccionesService]
})
class RefaccionesModule {
}
exports.RefaccionesModule = RefaccionesModule;
//# sourceMappingURL=refacciones.module.js.map