"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const contratos_controller_1 = require("./contratos.controller");
describe('ContratosController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [contratos_controller_1.ContratosController],
        }).compile();
        controller = module.get(contratos_controller_1.ContratosController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=contratos.controller.spec.js.map