import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownLeft, ArrowUpRight, Copy, QrCode, Send, Zap, Wallet, CreditCard, Building2, Smartphone, Clock, Shield } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface SendReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'send' | 'receive';
  defaultCurrency?: string;
}

export const SendReceiveModal = ({ isOpen, onClose, mode, defaultCurrency = 'USD' }: SendReceiveModalProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [message, setMessage] = useState('');
  const [autopilot, setAutopilot] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Enhanced form fields
  const [source, setSource] = useState('wallet');
  const [channel, setChannel] = useState('');
  const [timing, setTiming] = useState('standard');
  const [authStep, setAuthStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState('pending');

  // Specific payment method fields
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { wallets, sendPayment } = useWallet();
  const { toast } = useToast();

  // Generate receive address/details
  const receiveDetails = {
    address: `${currency}:${currency === 'BTC' ? 'bc1q' : currency === 'ETH' ? '0x' : ''}${Math.random().toString(36).substr(2, 9)}`,
    qrCode: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/><rect x="10" y="10" width="80" height="80" fill="white"/><text x="50" y="55" text-anchor="middle" fill="black" font-size="8">QR Code</text></svg>')}`
  };

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPayment({
        recipient,
        amount: parseFloat(amount),
        currency,
        message,
        route: autopilot ? undefined : 'manual'
      });
      
      toast({
        title: "Payment Sent",
        description: `Successfully sent ${amount} ${currency} to ${recipient}`,
      });
      
      onClose();
      setRecipient('');
      setAmount('');
      setMessage('');
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Address copied successfully",
    });
  };

  const availableBalance = wallets.find(w => w.currency === currency)?.balance || 0;
  
  // Mock exchange rates (in real app, these would be live from an API)
  const exchangeRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.80,
    KES: 155.50,
    NGN: 780.25,
    BTC: 43500,
    ETH: 2450
  };

  // Calculate conversion and fees
  const getConversionInfo = () => {
    const amountNum = parseFloat(amount) || 0;
    const rate = exchangeRates[currency] || 1;
    const usdValue = currency === 'USD' ? amountNum : amountNum / rate;
    const fee = Math.max(0.50, usdValue * 0.015); // 1.5% fee, minimum $0.50
    const totalCost = amountNum + (fee * rate);
    
    return {
      usdValue,
      fee: fee * rate,
      totalCost,
      rate: currency === 'USD' ? 1 : rate
    };
  };

  const conversionInfo = getConversionInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'send' ? (
              <>
                <ArrowUpRight className="h-5 w-5" />
                Send Payment
              </>
            ) : (
              <>
                <ArrowDownLeft className="h-5 w-5" />
                Receive Payment
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'send' 
              ? 'Send money using our AI-powered routing system' 
              : 'Generate address to receive payments'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'send' ? (
            <>
              {/* Enhanced Send Form */}
              
              {/* Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Source
                  </Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Wallet Balance
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </div>
                      </SelectItem>
                      <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Bank Account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.currency} value={wallet.currency}>
                          {wallet.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Destination Fields Based on Channel */}
              <div className="space-y-2">
                <Label>Destination Details</Label>
                {channel === 'mobile_money' && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Mobile Money Number</Label>
                      <Input 
                        placeholder="e.g. +254712345678 (M-Pesa)"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Recipient Name</Label>
                      <Input 
                        placeholder="Full name as registered"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                {(channel === 'sepa' || channel === 'swift') && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Bank Account Number / IBAN</Label>
                      <Input 
                        placeholder={channel === 'sepa' ? 'IBAN: DE89370400440532013000' : 'Account Number'}
                        value={channel === 'sepa' ? iban : bankAccount}
                        onChange={(e) => channel === 'sepa' ? setIban(e.target.value) : setBankAccount(e.target.value)}
                      />
                    </div>
                    {channel === 'swift' && (
                      <div>
                        <Label className="text-sm">SWIFT Code</Label>
                        <Input 
                          placeholder="e.g. DEUTDEFF"
                          value={swiftCode}
                          onChange={(e) => setSwiftCode(e.target.value)}
                        />
                      </div>
                    )}
                    <div>
                      <Label className="text-sm">Beneficiary Name</Label>
                      <Input 
                        placeholder="Full name on account"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {(channel === 'visa' || channel === 'mastercard') && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Card Number</Label>
                      <Input 
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Expiry Date</Label>
                        <Input 
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">CVV</Label>
                        <Input 
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Cardholder Name</Label>
                      <Input 
                        placeholder="Name on card"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {channel === 'crypto' && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Crypto Wallet Address</Label>
                      <Input 
                        placeholder="0x742d35Cc6326C0532C3aB..."
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Network</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                          <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                          <SelectItem value="polygon">Polygon (MATIC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {!channel && (
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      Please select a payment channel above to enter destination details
                    </p>
                  </div>
                )}
              </div>

              {/* Amount & Channel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Available: {availableBalance.toLocaleString()} {currency}</div>
                    {amount && (
                      <>
                        <div className="text-primary">≈ ${conversionInfo.usdValue.toFixed(2)} USD</div>
                        <div>Fee: {conversionInfo.fee.toFixed(2)} {currency}</div>
                        <div className="font-medium">Total: {conversionInfo.totalCost.toFixed(2)} {currency}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Channel
                  </Label>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="sepa">SEPA Transfer</SelectItem>
                      <SelectItem value="visa">Visa Network</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="crypto">Crypto Network</SelectItem>
                      <SelectItem value="swift">SWIFT Wire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reference & Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Textarea 
                    placeholder="Payment reference or note"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timing
                  </Label>
                  <Select value={timing} onValueChange={setTiming}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant (2-5 min)</SelectItem>
                      <SelectItem value="standard">Standard (1-2 hours)</SelectItem>
                      <SelectItem value="economy">Economy (1-3 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fees & Status Display */}
              {amount && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Transaction Summary</h4>
                    <Badge variant={status === 'pending' ? 'secondary' : status === 'processing' ? 'default' : status === 'completed' ? 'default' : 'destructive'}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange Rate</span>
                      <span>1 {currency} = ${(1/conversionInfo.rate).toFixed(4)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{amount} {currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Channel Fee</span>
                      <span>{conversionInfo.fee.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Time</span>
                      <span>{timing === 'instant' ? '2-5 min' : timing === 'standard' ? '1-2 hours' : '1-3 days'}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total Cost</span>
                      <span>{conversionInfo.totalCost.toFixed(2)} {currency}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Authentication Section */}
              {authStep && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Security Authentication</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Enter OTP Code</Label>
                    <Input 
                      placeholder="6-digit code from SMS/Email"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Autopilot</span>
                </div>
                <Badge variant={autopilot ? "default" : "secondary"}>
                  {autopilot ? "Enabled" : "Manual"}
                </Badge>
              </div>

              <Button 
                onClick={handleSend} 
                disabled={loading || !recipient || !amount || !channel || conversionInfo.totalCost > availableBalance}
                className="w-full"
              >
                {loading ? (
                  "Processing..."
                ) : authStep ? (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify & Send
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {amount || '0'} {currency}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Receive Form */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.currency} value={wallet.currency}>
                        {wallet.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Receive Address</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={receiveDetails.address}
                      readOnly
                      className="text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(receiveDetails.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <Label>QR Code</Label>
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">
                    Download QR Code
                  </Button>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Share this address to receive {currency} payments. 
                    Funds will appear in your wallet once confirmed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};