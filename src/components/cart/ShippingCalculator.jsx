
import { useState, useEffect } from 'react';
import { getMyAddresses } from '../../api/addressService';
import { calculateShipping } from '../../api/orderService';
import { useAuth } from '../../contexts/AuthContext';
import { Label } from '../common/Label';
import { LoaderCircle, PlusCircle } from 'lucide-react';

export default function ShippingCalculator({ onShippingSelect, onAddNewAddress }) {
    const { isAuthenticated } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [shippingOptions, setShippingOptions] = useState([]);
    const [isShippingLoading, setIsShippingLoading] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (isAuthenticated) {
                try {
                    const userAddresses = await getMyAddresses();
                    setAddresses(userAddresses || []);
                } catch (error) {
                    console.error("Erro ao buscar endereços:", error);
                }
            }
        };
        fetchAddresses();
    }, [isAuthenticated]);

    const handleAddressChange = async (event) => {
        const addressId = event.target.value;
        setSelectedAddress(addressId);
        setShippingOptions([]);
        onShippingSelect(null);
        if (!addressId) return;

        try {
            setIsShippingLoading(true);
            const options = await calculateShipping(addressId);
            setShippingOptions(options || []);
        } catch (error) {
            alert("Não foi possível calcular o frete para este endereço.");
        } finally {
            setIsShippingLoading(false);
        }
    };

    const handleShippingChange = (option) => {
        onShippingSelect({
            addressId: selectedAddress,
            ...option
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label htmlFor="address-select">Selecione um endereço de entrega</Label>
                <button 
                    onClick={onAddNewAddress} 
                    className="text-xs text-primary hover:underline flex items-center"
                >
                    <PlusCircle className="h-3 w-3 mr-1" /> 
                    Novo endereço
                </button>
            </div>

            <select
                id="address-select"
                value={selectedAddress}
                onChange={handleAddressChange}
                className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <option value="">Selecione um endereço</option>
                {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                        {`${addr.rua}, ${addr.numero} - ${addr.bairro}, ${addr.cidade} - CEP: ${addr.cep}`}
                    </option>
                ))}
            </select>

            {isShippingLoading && (
                <div className="flex justify-center py-4">
                    <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {shippingOptions.length > 0 && (
                <fieldset>
                    <legend className="text-sm font-medium mb-2">Opções de entrega:</legend>
                    <div className="space-y-2">
                        {shippingOptions.map(option => (
                            <label key={option.servico} className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 cursor-pointer">
                                <input
                                    type="radio"
                                    name="shipping-option"
                                    value={option.servico}
                                    onChange={() => handleShippingChange(option)}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <div className="flex justify-between items-center w-full">
                                    <span>{option.servico}</span>
                                    <span className="font-bold">R$ {parseFloat(option.valor).toFixed(2).replace('.', ',')}</span>
                                    <span className="text-sm text-muted-foreground">{option.prazo} dias úteis</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}
        </div>
    );
}