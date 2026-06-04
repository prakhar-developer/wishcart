import { useState } from 'react'

const SizeGuide = () => {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="text-xs text-pink-500 underline hover:text-pink-600">
        Size Guide 📏
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Size Guide 📏</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="bg-pink-50">
                  <th className="py-2 px-3 text-pink-500">Size</th>
                  <th className="py-2 px-3 text-pink-500">Chest (in)</th>
                  <th className="py-2 px-3 text-pink-500">Waist (in)</th>
                  <th className="py-2 px-3 text-pink-500">Hip (in)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-t border-pink-50"><td className="py-2">XS</td><td>32-33</td><td>24-25</td><td>34-35</td></tr>
                <tr className="border-t border-pink-50"><td className="py-2">S</td><td>34-35</td><td>26-27</td><td>36-37</td></tr>
                <tr className="border-t border-pink-50"><td className="py-2">M</td><td>36-37</td><td>28-29</td><td>38-39</td></tr>
                <tr className="border-t border-pink-50"><td className="py-2">L</td><td>38-40</td><td>30-32</td><td>40-42</td></tr>
                <tr className="border-t border-pink-50"><td className="py-2">XL</td><td>41-43</td><td>33-35</td><td>43-45</td></tr>
                <tr className="border-t border-pink-50"><td className="py-2">XXL</td><td>44-46</td><td>36-38</td><td>46-48</td></tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-4 text-center">Measurements are in inches. When in doubt, size up! 🎀</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SizeGuide