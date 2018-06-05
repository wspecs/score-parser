import {analyzeScore} from './lib/score';


export {analyzeScore};

if (process.argv[2] === 'score' && process.argv[3]) {
    console.log('yes');
    analyzeScore(process.argv[3]);
}