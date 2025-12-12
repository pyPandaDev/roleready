import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Star } from "lucide-react"
import { cn } from "../../lib/utils"

// Inline Button component (previously from ./button)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline";
    size?: "default" | "lg";
}

const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = "default",
    size = "default",
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
    const variants = {
        default: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
        outline: "border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
    };
    const sizes = {
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-lg"
    };
    return (
        <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
            {children}
        </button>
    );
};

// Inline Tabs components (previously from ./tabs)
interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
    return (
        <div data-value={value} onClick={(e) => {
            const target = e.target as HTMLElement;
            const triggerValue = target.closest('[data-trigger-value]')?.getAttribute('data-trigger-value');
            if (triggerValue) onValueChange(triggerValue);
        }}>
            {children}
        </div>
    );
};

const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("inline-flex items-center justify-center rounded-lg p-1", className)}>
        {children}
    </div>
);

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
    return (
        <button
            data-trigger-value={value}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                className
            )}
        >
            {children}
        </button>
    );
};

export interface Plan {
    title: string
    price: {
        monthly: number
        yearly: number
    }
    description: string
    features: string[]
    ctaText: string
    ctaHref: string
    isFeatured?: boolean
}

interface PricingTableProps {
    plans: Plan[]
    onPlanSelect?: (plan: Plan) => void
}

// Individual Digit Animation Component
const AnimatedDigit: React.FC<{ digit: string; index: number }> = ({ digit, index }) => {
    return (
        <div className="relative overflow-hidden inline-block min-w-[1ch] text-center">
            <AnimatePresence mode="wait">
                <motion.span
                    key={digit}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                    className="block"
                >
                    {digit}
                </motion.span>
            </AnimatePresence>
        </div>
    )
}

// Enhanced Scrolling Number Component with individual digit animations
const ScrollingNumber: React.FC<{ value: number }> = ({ value }) => {
    const numberString = value.toString()

    return (
        <div className="flex items-center">
            {numberString.split('').map((digit, index) => (
                <AnimatedDigit
                    key={`${value}-${index}`}
                    digit={digit}
                    index={index}
                />
            ))}
        </div>
    )
}

const PricingTable: React.FC<PricingTableProps> = ({ plans, onPlanSelect }) => {
    const [isYearly, setIsYearly] = useState(false)

    const getFeatureIcon = () => {
        return <Check className="w-3 h-3 text-slate-900 dark:text-white" />
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-16">
            {/* Header with Toggle */}
            <motion.div
                className="text-center space-y-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="space-y-4">
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                    >
                        Choose Your Plan
                    </motion.h1>
                    <motion.p
                        className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        Select the perfect plan for your career journey. All plans include our core AI-powered features.
                    </motion.p>
                </div>

                {/* Billing Toggle */}
                <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <Tabs
                        value={isYearly ? "yearly" : "monthly"}
                        onValueChange={(value) => setIsYearly(value === "yearly")}
                    >
                        <TabsList className="flex w-full h-12 cursor-pointer bg-slate-100 dark:bg-zinc-800">
                            <TabsTrigger value="monthly" className="text-base font-medium cursor-pointer flex-1 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly" className="text-base font-medium flex items-center gap-2 cursor-pointer flex-1 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">
                                Yearly
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">
                                    Save 20%
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </motion.div>
            </motion.div>

            {/* Pricing Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.title}
                        variants={cardVariants}
                        className="relative"
                    >
                        {/* Featured Badge */}
                        {plan.isFeatured && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                                className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                            >
                                <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                                    <Star className="w-3 h-3 fill-current" />
                                    Most Popular
                                </div>
                            </motion.div>
                        )}

                        <div className={cn(
                            "relative h-full p-8 rounded-2xl border-2 transition-all duration-300",
                            plan.isFeatured
                                ? "border-teal-500 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20 dark:border-teal-400 shadow-xl shadow-teal-500/10"
                                : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                        )}>
                            {/* Plan Header */}
                            <div className="text-center space-y-4 mb-8">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.title}</h3>
                                <p className="text-slate-600 dark:text-zinc-400">{plan.description}</p>

                                {/* Animated Price with Scrolling Numbers */}
                                <div className="space-y-2">
                                    <div className="text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center">
                                        $<ScrollingNumber value={isYearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly} />
                                        <span className="text-lg text-slate-500 dark:text-zinc-400 font-normal ml-1">
                                            /month
                                        </span>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-slate-500 dark:text-zinc-500 flex items-center justify-center gap-2"
                                    >
                                        <span>{isYearly ? `billed yearly` : `billed monthly`}</span>
                                        {isYearly && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium"
                                            >
                                                Save ${(plan.price.monthly * 12) - plan.price.yearly}
                                            </motion.span>
                                        )}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <motion.div
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 + featureIndex * 0.05 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                                            {getFeatureIcon()}
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-zinc-300">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                            >
                                <Button
                                    onClick={() => onPlanSelect?.(plan)}
                                    variant={plan.isFeatured ? "default" : "outline"}
                                    size="lg"
                                    className={cn(
                                        "w-full",
                                        plan.isFeatured
                                            ? "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0"
                                            : "border-slate-300 dark:border-zinc-700"
                                    )}
                                >
                                    {plan.ctaText}
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}

export default PricingTable
