"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const refacciones_controller_1 = require("./refacciones.controller");
describe('RefaccionesController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [refacciones_controller_1.RefaccionesController],
        }).compile();
        controller = module.get(refacciones_controller_1.RefaccionesController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=refacciones.controller.spec.js.map