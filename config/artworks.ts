import { ArtworkDefinition } from '@/types/artwork';
import { generateToken } from '@/utils/token';

// Components
import Artwork from '@/components/Artwork';
import GridArtwork from '@/components/GridArtwork';
import MosaicArtwork from '@/components/MosaicArtwork';
import RotatedGridArtwork from '@/components/RotatedGridArtwork';
import TreeArtwork from '@/components/TreeArtwork';
import TextDesignArtwork from '@/components/TextDesignArtwork';
import LambArtwork from '@/components/LambArtwork';

// Controls
import Controls from '@/components/Controls';
import GridControls from '@/components/GridControls';
import MosaicControls from '@/components/MosaicControls';
import RotatedGridControls from '@/components/RotatedGridControls';
import TreeControls from '@/components/TreeControls';
import TextDesignControls from '@/components/TextDesignControls';
import LambControls from '@/components/LambControls';
import FlowGenericControls from '@/components/FlowGenericControls';

// Generators
import {
    generateFlowParamsFromToken,
    generateGridParamsFromToken,
    generateMosaicParamsFromToken,
    generateRotatedGridParamsFromToken,
    generateTreeParamsFromToken,
    generateTextDesignParamsFromToken,
    generateLambParamsFromToken
} from '@/utils/artworkGenerator';

// Default Params Helper
const createRandomGenerator = (type: any, generator: any) => () => {
    const token = generateToken(type);
    return { ...generator(token), token };
};

export const ARTWORKS: Record<string, ArtworkDefinition> = {
    flow: {
        id: 'flow',
        title: 'Flow Field',
        description: 'Generative flow particles',
        component: Artwork,
        controls: FlowGenericControls,
        generator: generateFlowParamsFromToken,
        randomGenerator: createRandomGenerator('flow', generateFlowParamsFromToken),
        defaultParams: generateFlowParamsFromToken(generateToken('flow'))
    },
    grid: {
        id: 'grid',
        title: 'Grid System',
        description: 'Structured chaos',
        component: GridArtwork,
        controls: GridControls,
        generator: generateGridParamsFromToken,
        randomGenerator: createRandomGenerator('grid', generateGridParamsFromToken),
        defaultParams: generateGridParamsFromToken(generateToken('grid'))
    },
    mosaic: {
        id: 'mosaic',
        title: 'Mosaic',
        description: 'Tiled patterns',
        component: MosaicArtwork,
        controls: MosaicControls,
        generator: generateMosaicParamsFromToken,
        randomGenerator: createRandomGenerator('mosaic', generateMosaicParamsFromToken),
        regenerator: (currentParams: any) => {
            const newToken = generateToken('mosaic');
            const newParams = generateMosaicParamsFromToken(newToken);
            return {
                ...newParams,
                colorSeed: currentParams.colorSeed || currentParams.token,
                color1: currentParams.color1,
                color2: currentParams.color2,
                color3: currentParams.color3,
                color4: currentParams.color4,
                token: newToken
            };
        },
        defaultParams: generateMosaicParamsFromToken(generateToken('mosaic'))
    },
    rotated: {
        id: 'rotated',
        title: 'Rotated Grid',
        description: 'Angular compositions',
        component: RotatedGridArtwork,
        controls: RotatedGridControls,
        generator: generateRotatedGridParamsFromToken,
        randomGenerator: createRandomGenerator('rotated', generateRotatedGridParamsFromToken),
        regenerator: (currentParams: any) => {
            const newToken = generateToken('rotated');
            const newParams = generateRotatedGridParamsFromToken(newToken);
            return {
                ...newParams,
                colorSeed: currentParams.colorSeed || currentParams.token,
                color1: currentParams.color1,
                color2: currentParams.color2,
                color3: currentParams.color3,
                color4: currentParams.color4,
                backgroundColor: currentParams.backgroundColor,
                token: newToken
            };
        },
        defaultParams: generateRotatedGridParamsFromToken(generateToken('rotated'))
    },
    tree: {
        id: 'tree',
        title: 'Recursive Tree',
        description: 'Organic growth algorithms',
        component: TreeArtwork,
        controls: TreeControls,
        generator: generateTreeParamsFromToken,
        randomGenerator: createRandomGenerator('tree', generateTreeParamsFromToken),
        regenerator: (currentParams: any) => {
            const newToken = generateToken('tree');
            const newParams = generateTreeParamsFromToken(newToken);
            return {
                ...newParams,
                canvasWidth: currentParams.canvasWidth,
                canvasHeight: currentParams.canvasHeight,
                colorSeed: currentParams.colorSeed || currentParams.token,
                stemColor1: currentParams.stemColor1,
                stemColor2: currentParams.stemColor2,
                stemColor3: currentParams.stemColor3,
                tipColor1: currentParams.tipColor1,
                tipColor2: currentParams.tipColor2,
                tipColor3: currentParams.tipColor3,
                backgroundColor: currentParams.backgroundColor,
                token: newToken
            };
        },
        defaultParams: {
            initialPaths: 2,
            initialVelocity: 10,
            branchProbability: 0.2,
            diameterShrink: 0.65,
            minDiameter: 0.3,
            bumpMultiplier: 0.2,
            velocityRetention: 0.77,
            speedMin: 5,
            speedMax: 10,
            finishedCircleSize: 12,
            strokeWeightMultiplier: 1.1,
            stemColor1: "#3d2817",
            stemColor2: "#4a3319",
            stemColor3: "#5c3d1f",
            tipColor1: "#e8c4a0",
            tipColor2: "#f0d4b8",
            tipColor3: "#d9b89a",
            backgroundColor: "#fafafa",
            textContent: "",
            textEnabled: false,
            fontSize: 24,
            textColor: "#333333",
            textAlign: 'center',
            textX: 400,
            textY: 50,
            lineHeight: 1.5,
            fontFamily: 'Georgia, serif',
            fontUrl: '',
            customFontFamily: '',
            grainAmount: 0,
            canvasWidth: 400,
            canvasHeight: 400,
            token: "fx-default-tree-token",
            exportWidth: 1600,
            exportHeight: 2000,
            isAnimating: true,
        }
    },
    textdesign: {
        id: 'textdesign',
        title: 'Text Design',
        description: 'Typography experiments',
        component: TextDesignArtwork,
        controls: TextDesignControls,
        generator: generateTextDesignParamsFromToken,
        randomGenerator: createRandomGenerator('text', generateTextDesignParamsFromToken),
        defaultParams: generateTextDesignParamsFromToken(generateToken('text'))
    },
    lamb: {
        id: 'lamb',
        title: 'Lamb',
        description: 'Generative noise field',
        component: LambArtwork,
        controls: LambControls,
        generator: generateLambParamsFromToken,
        randomGenerator: createRandomGenerator('lamb', generateLambParamsFromToken),
        defaultParams: generateLambParamsFromToken(generateToken('lamb'))
    }
};
