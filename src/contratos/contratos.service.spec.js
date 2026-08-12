"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const contratos_service_1 = require("./contratos.service");
describe('ContratosService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [contratos_service_1.ContratosService],
        }).compile();
        service = module.get(contratos_service_1.ContratosService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=contratos.service.spec.js.map