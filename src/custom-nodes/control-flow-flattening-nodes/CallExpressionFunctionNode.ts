import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as ESTree from 'estree';

import { TIdentifierNamesGeneratorFactory } from '../../types/container/generators/TIdentifierNamesGeneratorFactory';
import { TStatement } from '../../types/node/TStatement';

import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';
import { ICustomNodeFormatter } from '../../interfaces/custom-nodes/ICustomNodeFormatter';

import { initializable } from '../../decorators/Initializable';

import { AbstractCustomNode } from '../AbstractCustomNode';
import { NodeFactory } from '../../node/NodeFactory';
import { NodeUtils } from '../../node/NodeUtils';

@injectable()
export class CallExpressionFunctionNode extends AbstractCustomNode {
    /**
     * @type {(ESTree.Expression | ESTree.SpreadElement)[]}
     */
    @initializable()
    private expressionArguments!: (ESTree.Expression | ESTree.SpreadElement)[];

    /**
     * @param {TIdentifierNamesGeneratorFactory} identifierNamesGeneratorFactory
     * @param {ICustomNodeFormatter} customNodeFormatter
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    public constructor (
        @inject(ServiceIdentifiers.Factory__IIdentifierNamesGenerator)
            identifierNamesGeneratorFactory: TIdentifierNamesGeneratorFactory,
        @inject(ServiceIdentifiers.ICustomNodeFormatter) customNodeFormatter: ICustomNodeFormatter,
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(identifierNamesGeneratorFactory, customNodeFormatter, randomGenerator, options);
    }

    /**
     * @param {(Expression | SpreadElement)[]} expressionArguments
     */
    public initialize (expressionArguments: (ESTree.Expression | ESTree.SpreadElement)[]): void {
        this.expressionArguments = expressionArguments;
    }

    /**
     * @param {string} nodeTemplate
     * @returns {TStatement[]}
     */
    protected getNodeStructure (nodeTemplate: string): TStatement[] {
        const calleeIdentifier: ESTree.Identifier = NodeFactory.identifierNode('callee');
        const params: ESTree.Identifier[] = [];
        const argumentsLength: number = this.expressionArguments.length;

        for (let i: number = 0; i < argumentsLength; i++) {
            params.push(NodeFactory.identifierNode(`param${i + 1}`));
        }

        const structure: TStatement = NodeFactory.expressionStatementNode(
            NodeFactory.functionExpressionNode(
                [
                    calleeIdentifier,
                    ...params
                ],
                NodeFactory.blockStatementNode([
                    NodeFactory.returnStatementNode(
                        NodeFactory.callExpressionNode(
                            calleeIdentifier,
                            params
                        )
                    )
                ])
            )
        );

        NodeUtils.parentizeAst(structure);

        return [structure];
    }
}
