/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import testAssetWorkspace from './testAssets/testAssetWorkspace';
import {
    activateCSharpExtension,
    closeAllEditorsAsync,
    openFileInWorkspaceAsync,
    sortLocations,
} from './integrationHelpers';
import { describe, beforeAll, beforeEach, afterAll, test, expect, afterEach } from '@jest/globals';

describe(`[${testAssetWorkspace.description}] Test Go To Implementation`, () => {
    beforeAll(async () => {
        await activateCSharpExtension();
    });

    beforeEach(async () => {
        await openFileInWorkspaceAsync(path.join('src', 'app', 'implementation.cs'));
    });

    afterAll(async () => {
        await testAssetWorkspace.cleanupWorkspace();
    });

    afterEach(async () => {
        await closeAllEditorsAsync();
    });

    test('Finds implementations', async () => {
        const requestPosition = new vscode.Position(4, 22);
        const implementationList = await getImplementations(requestPosition);

        expect(implementationList).toHaveLength(3);

        expect(implementationList[0].uri.path).toContain('BaseClassImplementation.cs');
        expect(implementationList[0].range).toStrictEqual(new vscode.Range(2, 17, 2, 40));

        expect(implementationList[1].uri.path).toContain('implementation.cs');
        expect(implementationList[1].range).toStrictEqual(new vscode.Range(4, 17, 4, 26));

        expect(implementationList[2].uri.path).toContain('implementation.cs');
        expect(implementationList[2].range).toStrictEqual(new vscode.Range(5, 17, 5, 26));
    });
});

async function getImplementations(position: vscode.Position): Promise<vscode.Location[]> {
    const implementationList = <vscode.Location[]>(
        await vscode.commands.executeCommand(
            'vscode.executeImplementationProvider',
            vscode.window.activeTextEditor!.document.uri,
            position
        )
    );

    return sortLocations(implementationList);
}
