import React, { useState, useRef } from 'react'; 
import FormField from '../components/FormField';
import Button from '../components/Button';

class InvalidInputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidInputError';
    }
}

const Task1: React.FC = () => { 
    const [inputValue, setInputValue] = useState(''); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [result, setResult] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [delayTime, setDelayTime] = useState(1000);

    const abortControllerRef = useRef<AbortController | null>(null); 
    const parseInput = (input: string): number[] => {
        try { 
            const values = input.split(',').map(val => val.trim());
            const numbers = values.map(val => {
                const num = Number(val);
                if (isNaN(num)) {
                throw new InvalidInputError(`"${val}" is not a valid number`);
                }
                return num;
            });
            return numbers;
        } catch (err) {
            if (err instanceof InvalidInputError) {
                throw err;
            }
            throw new InvalidInputError('Invalid input format. Please use comma-separated numbers.');
        }
    };

    const processWithDelay = async (
        numbers: number[],
        delayMs: number,
        abortSignal?: AbortSignal
    ): Promise<void> => { 
        if (numbers.length === 0) {
            return Promise.resolve();
        } 
        setResult([]); 
        for (let i = 0; i < numbers.length; i++) { 
            if (abortSignal?.aborted) {
                setResult(prev => [...prev, 'Processing cancelled']);
                return Promise.reject(new Error('Processing cancelled'));
            } 
            const newResult = `${numbers[i]}`;
            setResult(prev => [...prev, newResult]);  
            setProgress({ current: i + 1, total: numbers.length }); 
            if (i < numbers.length - 1) {
                await new Promise<void>((resolve) => {
                    const timeoutId = setTimeout(() => resolve(), delayMs); 
                    if (abortSignal) {
                        abortSignal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                        resolve();
                        }, { once: true });
                    }
                });
            }
        } 
        return Promise.resolve();
    };

    const handleSubmit = async () => {
        try {
            setError('');
            const parsedNumbers = parseInput(inputValue);
            // setNumbers(parsedNumbers);
            setIsProcessing(true);
            setProgress({ current: 0, total: parsedNumbers.length }); 
            abortControllerRef.current = new AbortController(); 
            await processWithDelay(parsedNumbers, delayTime, abortControllerRef.current.signal);
            setResult(prev => [...prev, 'Processing completed']);
        } catch (err: any) {
                setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white">
            <h1 className="text-2xl font-bold mb-4 text-blue-600">Number Processor</h1> 
                <FormField
                    label='Enter numbers (comma-separated):'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="1, 2, 3, 4, 5"
                    disabled={isProcessing}
                />  
                <FormField
                    label='Delay (milliseconds):'
                    type="number"
                    value={delayTime.toString()}
                    onChange={(e) => setDelayTime(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="100"
                    max="5000"
                    step="100"
                    disabled={isProcessing}
                />  
        
            <div className="flex gap-2 my-4">
                <Button
                    onClick={handleSubmit}
                    disabled={isProcessing || !inputValue.trim()}                
                >
                    Process Numbers
                </Button> 
                {isProcessing && (
                    <Button
                        variant='secondary'
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        
            {isProcessing && (
                <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }}
                        ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Progress: {progress.current}/{progress.total} ({progress.total ? Math.round((progress.current / progress.total) * 100) : 0}%)
                    </p>
                </div>
            )}
        
            {result.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-2">Results:</h2>
                    <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-60 overflow-y-auto">
                        {result.map((item, index) => (
                        <div 
                            key={index}
                            className={`py-1 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                            {item}
                        </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Task1;