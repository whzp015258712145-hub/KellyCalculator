import { useState, useEffect } from 'react';
import './style.css';

// --- Helper Components ---

const InputField = ({ label, value, onChange, unit }: { label: string, value: number, onChange: (e: any) => void, unit?: string }) => (
    <div className="mb-4">
      <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor={label}>
        {label} {unit && <span className="text-gray-400 text-xs">({unit})</span>}
      </label>
      <input
        id={label}
        className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline"
        type="number"
        value={value}
        onChange={onChange}
      />
    </div>
);

const FormattedNumberInput = ({ label, value, onChange, unit }: { label: string, value: number, onChange: (val: number) => void, unit?: string }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (!isNaN(Number(rawValue))) {
            onChange(Number(rawValue));
        }
    };

    const formattedValue = new Intl.NumberFormat('en-US').format(value);

    return (
        <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor={label}>
                {label} {unit && <span className="text-gray-400 text-xs">({unit})</span>}
            </label>
            <input
                id={label}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={formattedValue}
                onChange={handleChange}
            />
        </div>
    );
};

// --- Main App Component ---

const SAVED_STATE_KEY = 'kellyCalculatorState_v3'; 

function App() {
  const loadInitialState = () => {
    try {
      const savedStateJSON = localStorage.getItem(SAVED_STATE_KEY);
      if (savedStateJSON) {
        return JSON.parse(savedStateJSON);
      }
    } catch (e) {
      console.error("Failed to parse saved state:", e);
    }
    return null;
  };

  const initialState = loadInitialState();

  const [totalCapital, setTotalCapital] = useState(initialState?.totalCapital || 10000);
  const [winRate, setWinRate] = useState(initialState?.winRate || 60);
  const [currentPrice, setCurrentPrice] = useState(initialState?.currentPrice || 100);
  const [stopLossPrice, setStopLossPrice] = useState(initialState?.stopLossPrice || 90);
  const [takeProfitPrice, setTakeProfitPrice] = useState(initialState?.takeProfitPrice || 120);

  const [result, setResult] = useState<any>(null);
  
  useEffect(() => {
    const stateToSave = {
      totalCapital,
      winRate,
      currentPrice,
      stopLossPrice,
      takeProfitPrice,
    };
    localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(stateToSave));
  }, [totalCapital, winRate, currentPrice, stopLossPrice, takeProfitPrice]);


  const handleCalculate = () => {
    const res = calculateKelly({
      totalCapital,
      winRate,
      takeProfitPrice,
      currentPrice,
      stopLossPrice,
    });
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-teal-400">凯利公式计算器</h1>
        
        <FormattedNumberInput label="总资金" value={totalCapital} onChange={setTotalCapital} unit="$" />
        <InputField label="胜率" value={winRate} onChange={(e) => setWinRate(parseFloat(e.target.value))} unit="%" />
        <InputField label="当前价格" value={currentPrice} onChange={(e) => setCurrentPrice(parseFloat(e.target.value))} unit="$" />
        <InputField label="止损价格" value={stopLossPrice} onChange={(e) => setStopLossPrice(parseFloat(e.target.value))} unit="$" />
        <InputField label="止盈价格" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(parseFloat(e.target.value))} unit="$" />

        <button
          onClick={handleCalculate}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          计算
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-700 rounded">
            <h2 className="text-xl font-bold mb-2 text-center">计算结果</h2>
            {result.error ? (
              <p className="text-red-400 text-center">{result.error}</p>
            ) : (
              <div className="text-center">
                 {result.tradeDirection && (
                  <p className="text-sm mb-2 text-gray-400">
                    自动识别为: <span className={result.tradeDirection === 'long' ? 'text-teal-400' : 'text-red-400'}>{result.tradeDirection === 'long' ? '做多 (Long)' : '做空 (Short)'}</span>
                  </p>
                )}
                <p className="text-lg">
                  盈亏比: <span className="font-bold text-teal-400">{result.payoutRatio.toFixed(2)}</span>
                </p>
                <p className="text-lg">
                  凯利百分比 (f*): <span className="font-bold text-teal-400">{result.kellyFraction.toFixed(2)}%</span>
                </p>
                <p className="text-lg">
                  全凯利资金: <span className="font-bold text-teal-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.investment)}
                  </span>
                </p>
                <p className="text-lg">
                  半凯利资金: <span className="font-bold text-teal-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.investment / 2)}
                  </span>
                </p>
                {result.message && <p className="mt-2 text-yellow-400">{result.message}</p>}
              </div>
            )}
          </div>
        )}
      </div>
       <footer className="text-center text-gray-500 text-xs mt-4">
          <p>仅供参考，不构成投资建议。</p>
      </footer>
    </div>
  );
}

// --- Utility Functions ---

function calculateKelly(params: {
  totalCapital: number;
  winRate: number;
  takeProfitPrice: number;
  currentPrice: number;
  stopLossPrice: number;
}) {
  const { totalCapital, winRate, takeProfitPrice, currentPrice, stopLossPrice } = params;

  let tradeDirection: 'long' | 'short' | 'invalid' = 'invalid';
  if (takeProfitPrice > currentPrice && stopLossPrice < currentPrice) {
    tradeDirection = 'long';
  } else if (takeProfitPrice < currentPrice && stopLossPrice > currentPrice) {
    tradeDirection = 'short';
  }

  if (tradeDirection === 'invalid') {
    return { error: '价格设置无效 (止盈价和止损价必须在当前价格的两侧)' };
  }
  
  let profitPerShare: number;
  let lossPerShare: number;

  if (tradeDirection === 'long') {
    profitPerShare = takeProfitPrice - currentPrice;
    lossPerShare = currentPrice - stopLossPrice;
  } else { 
    profitPerShare = currentPrice - takeProfitPrice;
    lossPerShare = stopLossPrice - currentPrice;
  }

  if (lossPerShare <= 0) {
      return { error: '价格设置无效，无法计算盈亏比。' };
  }

  const payoutRatio = profitPerShare / lossPerShare;
  const p = winRate / 100;
  const q = 1 - p;

  const kellyFraction = p - q / payoutRatio;

  if (kellyFraction <= 0) {
    return {
      kellyFraction: kellyFraction * 100,
      investment: 0,
      message: '凯利比率为负或零，不建议投资。',
      tradeDirection,
      payoutRatio: payoutRatio,
    };
  }

  const investment = totalCapital * kellyFraction;

  return {
    kellyFraction: kellyFraction * 100,
    investment: investment,
    tradeDirection,
    payoutRatio: payoutRatio,
  };
}

export default App;
