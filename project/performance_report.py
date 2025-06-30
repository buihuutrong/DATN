import json
import os
from datetime import datetime

class PerformanceReporter:
    """Lớp tạo báo cáo hiệu suất đơn giản cho thuật toán GA"""
    
    def __init__(self):
        self.reports = []
    
    def load_log_data(self, log_file="performance_log.jsonl"):
        if not os.path.exists(log_file):
            print(f"❌ Không tìm thấy file log: {log_file}")
            return
        with open(log_file, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    self.reports.append(json.loads(line))
                except Exception as e:
                    print(f"Lỗi đọc dòng log: {e}")
        print(f"✅ Đã nạp {len(self.reports)} bản ghi hiệu suất từ file log.")
    
    def print_summary_report(self):
        if not self.reports:
            print("❌ Không có dữ liệu để báo cáo")
            return
        total_requests = len(self.reports)
        total_time = sum(r["execution_time"] for r in self.reports)
        avg_time = total_time / total_requests
        avg_accuracy = sum(r["accuracy"] for r in self.reports) / total_requests
        avg_generations = sum(r["generations"] for r in self.reports) / total_requests
        min_time = min(r["execution_time"] for r in self.reports)
        max_time = max(r["execution_time"] for r in self.reports)
        min_accuracy = min(r["accuracy"] for r in self.reports)
        max_accuracy = max(r["accuracy"] for r in self.reports)
        min_generations = min(r["generations"] for r in self.reports)
        max_generations = max(r["generations"] for r in self.reports)
        
        print("\n" + "="*80)
        print("📈 BÁO CÁO TÓM TẮT HIỆU SUẤT THUẬT TOÁN GA")
        print("="*80)
        print(f"📊 Tổng số lần tạo thực đơn: {total_requests}")
        print(f"📅 Khoảng thời gian: {min(r['date'] for r in self.reports)} đến {max(r['date'] for r in self.reports)}")
        
        print(f"\n⏱️  THỐNG KÊ THỜI GIAN THỰC THI:")
        print(f"   • Trung bình: {avg_time:.3f} giây")
        print(f"   • Nhanh nhất: {min_time:.3f} giây")
        print(f"   • Chậm nhất: {max_time:.3f} giây")
        print(f"   • Tổng thời gian: {total_time:.3f} giây")
        
        print(f"\n🎯 THỐNG KÊ ĐỘ CHÍNH XÁC CALORIES:")
        print(f"   • Trung bình: {avg_accuracy:.1%}")
        print(f"   • Cao nhất: {max_accuracy:.1%}")
        print(f"   • Thấp nhất: {min_accuracy:.1%}")
        
        print(f"\n🔄 THỐNG KÊ THUẬT TOÁN:")
        print(f"   • Trung bình số thế hệ: {avg_generations:.1f}")
        print(f"   • Ít nhất: {min_generations} thế hệ")
        print(f"   • Nhiều nhất: {max_generations} thế hệ")
        print(f"   • Tổng số thế hệ: {sum(r['generations'] for r in self.reports)}")
        
        # Phân tích hiệu suất
        print(f"\n🔍 PHÂN TÍCH HIỆU SUẤT:")
        fast_runs = sum(1 for r in self.reports if r["execution_time"] < 1.0)
        slow_runs = sum(1 for r in self.reports if r["execution_time"] > 5.0)
        early_stops = sum(1 for r in self.reports if r["generations"] < 50)
        
        print(f"   • Chạy nhanh (< 1s): {fast_runs}/{total_requests} ({fast_runs/total_requests:.1%})")
        print(f"   • Chạy chậm (> 5s): {slow_runs}/{total_requests} ({slow_runs/total_requests:.1%})")
        print(f"   • Dừng sớm (< 50 thế hệ): {early_stops}/{total_requests} ({early_stops/total_requests:.1%})")
        
        print(f"\n🌟 ĐÁNH GIÁ TỔNG THỂ:")
        if avg_time < 1.0 and avg_accuracy > 0.9:
            print("   ✅ Hệ thống hoạt động rất tốt! (Thuật toán hội tụ nhanh)")
        elif avg_time < 5.0 and avg_accuracy > 0.85:
            print("   ✅ Hệ thống hoạt động tốt")
        elif avg_time < 1.0 and avg_accuracy < 0.8:
            print("   ⚠️  Thuật toán chạy nhanh nhưng độ chính xác thấp - cần tăng số thế hệ")
        else:
            print("   ⚠️  Hệ thống cần cải thiện")
        
        print("="*80)

def main():
    print("🚀 KHỞI ĐỘNG HỆ THỐNG BÁO CÁO HIỆU SUẤT")
    print("="*50)
    reporter = PerformanceReporter()
    reporter.load_log_data()
    reporter.print_summary_report()
    print("\n✅ Hoàn thành báo cáo!")

if __name__ == "__main__":
    main() 