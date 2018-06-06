import {analyzeScore} from './lib/score';
import {analyzeStaff} from './lib/staff';


export {analyzeScore};

if (process.argv[2] === 'score' && process.argv[3]) {
    console.log('yes');
    analyzeScore(process.argv[3]);
}

if (process.argv[2] === 'staff' && process.argv[3]) {
    console.log('yes');
    analyzeStaff(`images/tmp/staff/${process.argv[3]}.jpg`);
}