"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const conceptos_service_1 = require("./conceptos.service");
describe('ConceptosService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [conceptos_service_1.ConceptosService],
        }).compile();
        service = module.get(conceptos_service_1.ConceptosService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=conceptos.service.spec.js.map